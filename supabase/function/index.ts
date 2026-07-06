import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    const supabaseAdmin = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const body = await req.json();
    const { action, ...payload } = body;

    // Allow unauthenticated "ensure-demo" action to create demo user if missing
    if (action === "ensure-demo") {
        const { data } = await supabaseAdmin.auth.admin.listUsers();
        const demoExists = data?.users?.some(
            (u) => u.email === "visitante@sistema.local",
        );
        if (!demoExists) {
            const { error } = await supabaseAdmin.auth.admin.createUser({
                email: "visitante@sistema.local",
                password: "visitante123",
                email_confirm: true,
                user_metadata: { display_name: "Visitante" },
            });
            if (error)
                return new Response(JSON.stringify({ error: error.message }), {
                    status: 400,
                    headers: corsHeaders,
                });
        }
        return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    // All other actions require admin auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
        return new Response(JSON.stringify({ error: "Não autorizado" }), {
            status: 401,
            headers: corsHeaders,
        });
    }

    const supabaseUser = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: authHeader } } },
    );
    const {
        data: { user: caller },
    } = await supabaseUser.auth.getUser();
    if (!caller || caller.email !== "admin@sistema.local") {
        return new Response(
            JSON.stringify({ error: "Acesso restrito ao administrador" }),
            { status: 403, headers: corsHeaders },
        );
    }

    if (action === "list") {
        const { data, error } = await supabaseAdmin.auth.admin.listUsers();
        if (error)
            return new Response(JSON.stringify({ error: error.message }), {
                status: 400,
                headers: corsHeaders,
            });

        const users = (data.users || []).map((u) => ({
            id: u.id,
            email: u.email,
            display_name: u.user_metadata?.display_name || "Operador",
            created_at: u.created_at,
        }));
        return new Response(JSON.stringify({ users }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    if (action === "create") {
        const { username, password, display_name } = payload;
        if (!username || !password || !display_name) {
            return new Response(
                JSON.stringify({ error: "Campos obrigatórios faltando" }),
                { status: 400, headers: corsHeaders },
            );
        }
        const email = username.includes("@")
            ? username
            : `${username}@sistema.local`;
        const { error } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { display_name },
        });
        if (error)
            return new Response(JSON.stringify({ error: error.message }), {
                status: 400,
                headers: corsHeaders,
            });
        return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    if (action === "delete") {
        const { user_id } = payload;
        if (!user_id) {
            return new Response(
                JSON.stringify({ error: "ID do usuário obrigatório" }),
                { status: 400, headers: corsHeaders },
            );
        }
        const { error } = await supabaseAdmin.auth.admin.deleteUser(user_id);
        if (error)
            return new Response(JSON.stringify({ error: error.message }), {
                status: 400,
                headers: corsHeaders,
            });
        return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    return new Response(JSON.stringify({ error: "Ação inválida" }), {
        status: 400,
        headers: corsHeaders,
    });
});
