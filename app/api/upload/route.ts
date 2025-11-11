import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) throw new Error("❌ Missing NEXT_PUBLIC_SUPABASE_URL");
  if (!supabaseKey) throw new Error("❌ Missing SUPABASE_SERVICE_ROLE_KEY or ANON_KEY");

  return createClient(supabaseUrl, supabaseKey);
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }
    const supabase = getSupabase();

    const fileName = `fields/${Date.now()}-${file.name}`;

    const { data, error } = await supabase.storage
      .from("fields")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const { data: publicUrlData } = supabase.storage.from("fields").getPublicUrl(fileName);

    return NextResponse.json({
      url: publicUrlData.publicUrl,
      message: "✅ File uploaded successfully!",
    });
  } catch (err: any) {
    console.error("❌ Upload error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
