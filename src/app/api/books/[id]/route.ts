import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET single book
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const book = await prisma.book.findUnique({
      where: { BookID: id },
      include: { Category: true, Copies: true },
    });

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    return NextResponse.json(book);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Update a book
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const data = await req.json();

    // Check if book exists
    const existingBook = await prisma.book.findUnique({
      where: { BookID: id },
    });

    if (!existingBook) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    // Check for duplicates (only if title OR author changed)
    if (
      data.title !== existingBook.Title ||
      data.author !== existingBook.Author
    ) {
      const duplicate = await prisma.book.findFirst({
        where: {
          Title: data.title,
          Author: data.author,
          NOT: { BookID: id },
        },
      });

      if (duplicate) {
        return NextResponse.json(
          { error: "A book with this title and author already exists" },
          { status: 409 }
        );
      }
    }

    const updatedBook = await prisma.book.update({
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
      },
    });

    return NextResponse.json(updatedBook, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Delete a book
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // Check if book exists
    const existingBook = await prisma.book.findUnique({
      where: { BookID: id },
    });

    if (!existingBook) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    // Delete the book (Prisma will cascade delete copies, wishlists, etc.)
    await prisma.book.delete({
      where: { BookID: id },
    });

    return NextResponse.json({ message: "Book deleted successfully" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
