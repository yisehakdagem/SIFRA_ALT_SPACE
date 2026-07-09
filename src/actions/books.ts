"use server";

import { createClient } from "@/lib/supabase/server";

export async function getBooksData() {
  const supabase = await createClient();

  // Fetch categories
  const { data: categories, error: catError } = await supabase
    .from("book_categories")
    .select("id, name")
    .order("name");

  if (catError) {
    console.error("Book category fetch error:", catError);
    throw new Error("Failed to load book categories");
  }

  // Fetch books with their category name
  const { data: books, error: bookError } = await supabase
    .from("books")
    .select(`
      id,
      title,
      author,
      cover_url,
      availability_status,
      category:book_categories(name)
    `)
    .order("title");

  if (bookError) {
    console.error("Book fetch error:", bookError);
    throw new Error("Failed to load books");
  }

  return {
    categories: categories ?? [],
    books: books?.map((book: any) => ({
      id: book.id,
      title: book.title,
      author: book.author,
      cover: book.cover_url,
      availability: book.availability_status,
      category: book.category?.name ?? "Uncategorized",
    })) ?? [],
  };
}