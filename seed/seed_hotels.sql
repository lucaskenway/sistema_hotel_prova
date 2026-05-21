-- Seed de exemplo para popular o banco com dados fictícios

INSERT INTO hotels (name, legal_id) VALUES ('Hotel Aurora', '00.000.000/0001-01');
INSERT INTO hotels (name, legal_id) VALUES ('Pousada Sol', '00.000.000/0001-02');

-- Exemplo de categorias e quartos para o primeiro hotel
INSERT INTO room_categories (hotel_id, name, capacity, price_per_night)
SELECT id, 'Standard', 2, 120.00 FROM hotels WHERE name='Hotel Aurora' LIMIT 1;

INSERT INTO room_categories (hotel_id, name, capacity, price_per_night)
SELECT id, 'Suite', 4, 320.00 FROM hotels WHERE name='Hotel Aurora' LIMIT 1;

INSERT INTO rooms (hotel_id, category_id, number, floor, status)
SELECT h.id, rc.id, '101', 1, 'AVAILABLE' FROM hotels h JOIN room_categories rc ON h.id = rc.hotel_id WHERE h.name='Hotel Aurora' AND rc.name='Standard' LIMIT 1;

INSERT INTO users (hotel_id, name, email, password_hash, role)
SELECT id, 'Admin Local', 'admin@aurora.example', 'HASHED_PASSWORD_PLACEHOLDER', 'ADMIN' FROM hotels WHERE name='Hotel Aurora' LIMIT 1;

-- Hóspede e reserva de exemplo
INSERT INTO guests (hotel_id, full_name, cpf, phone, email)
SELECT id, 'João Silva', '11122233344', '+55-11-90000-0000', 'joao@example.com' FROM hotels WHERE name='Hotel Aurora' LIMIT 1;

-- Observação: para reservas e pagamentos, recomenda-se usar transações na aplicação para garantir consistência.
