// Backend/controller/book.controller.js 
import Book from "../model/book.model.js";

// GET all books (public)
export const getBooks = async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });
    res.status(200).json(books);
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET single book by id (public)
export const getBookById = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    res.status(200).json(book);
  } catch (error) {
    console.error("Error fetching book by id:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// POST create book (admin only)
export const createBook = async (req, res) => {
  try {
    const {
      name,
      price,
      category,
      image,
      title,
      description,
      author,
      genre,
      publisher,
      language,
      pages,
    } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    const newBook = new Book({
      name,
      price,
      category,
      image,
      title,
      description,
      author,
      genre,
      publisher,
      language,
      pages,
    });

    await newBook.save();
    res.status(201).json({ message: "Book created", book: newBook });
  } catch (error) {
    console.error("Create book error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// PUT update book (admin only)
export const updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Book.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updated) {
      return res.status(404).json({ message: "Book not found" });
    }
    res.status(200).json({ message: "Book updated", book: updated });
  } catch (error) {
    console.error("Update book error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// DELETE book (admin only)
export const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Book.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Book not found" });
    }
    res.status(200).json({ message: "Book deleted" });
  } catch (error) {
    console.error("Delete book error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
