import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const book = await prisma.book.findUnique({
      where: { BookID: params.id },
      include: { Category: true, Copies: true }
    });
    if (!book) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(book);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const data = await req.json();
    const book = await prisma.book.update({
      where: { BookID: params.id },
      data: {
        Title: data.title,
        Author: data.author,
        ISBN: data.isbn,
        CategoryID: data.categoryId,
        PublicationYear: data.year ? parseInt(data.year) : null,
        Language: data.language,
        Edition: data.edition,
        Description: data.description,
        ShelfLocation: data.location,
        CoverImage: data.cover,
      }
    });
    return NextResponse.json(book);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.book.delete({ where: { BookID: params.id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
