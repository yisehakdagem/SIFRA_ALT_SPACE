import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const book = await prisma.book.findUnique({
      where: { BookID: id },
      include: { Category: true, Copies: true }
    });
    if (!book) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(book);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await req.json();
    const book = await prisma.book.update({
      where: { BookID: id },
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

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.book.delete({ where: { BookID: id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
