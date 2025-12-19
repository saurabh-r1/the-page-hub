```mermaid
erDiagram
    USER {
        ObjectId _id PK
        string fullname
        string email
        string password
        string role
        datetime createdAt
    }

    BOOK {
        ObjectId _id PK
        string name
        string author
        string category
        number price
        string image
    }

    ORDER {
        ObjectId _id PK
        ObjectId userId FK
        number total
        string status
        datetime createdAt
    }

    ORDER_ITEM {
        ObjectId _id PK
        ObjectId orderId FK
        ObjectId bookId FK
        number qty
        number priceAtPurchase
    }

    PAYMENT {
        ObjectId _id PK
        ObjectId orderId FK
        string paymentStatus
        number amount
        datetime createdAt
    }

    USER ||--o{ ORDER : "places"
    ORDER ||--|{ ORDER_ITEM : "contains"
    BOOK ||--o{ ORDER_ITEM : "refers"
    ORDER ||--|| PAYMENT : "has"
