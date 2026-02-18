CREATE TABLE IF NOT EXISTS book_sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(12, 2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_book_sales_book_id ON book_sales(book_id);
CREATE INDEX IF NOT EXISTS idx_book_sales_buyer_id ON book_sales(buyer_id);
CREATE INDEX IF NOT EXISTS idx_book_sales_created_at ON book_sales(created_at);
