# Escopo do Backend

## 1. Autenticação

### Funcionalidades

* login;
* registro;
* JWT;
* proteção de rotas.

### Entidade

User:

* id;
* name;
* email;
* password;
* role.

---

# 2. Quartos

### Funcionalidades

* cadastrar quarto;
* listar quartos;
* atualizar quarto;
* remover quarto;
* listar quartos disponíveis.

### Entidade

Room:

* id;
* number;
* floor;
* capacity;
* pricePerNight;
* status.

### Status

* AVAILABLE;
* OCCUPIED;
* MAINTENANCE;
* CLEANING.

---

# 3. Hóspedes

### Funcionalidades

* cadastrar hóspede;
* listar hóspedes;
* buscar hóspede;
* atualizar hóspede;
* remover hóspede.

### Entidade

Guest:

* id;
* fullName;
* cpf;
* phone;
* email.

---

# 4. Reservas (Módulo Principal)

### Funcionalidades

* criar reserva;
* listar reservas;
* buscar reserva;
* cancelar reserva;
* check-in;
* check-out.

### Entidade

Reservation:

* id;
* guestId;
* roomId;
* checkInDate;
* checkOutDate;
* status.

### Status

* PENDING;
* CONFIRMED;
* CHECKED_IN;
* CHECKED_OUT;
* CANCELLED.

---

# Regras de Negócio

## Regra 1

Não permitir reservas conflitantes no mesmo quarto.

---

## Regra 2

Check-in altera status do quarto.

---

## Regra 3

Check-out libera quarto.

---

## Regra 4

Cancelamento libera disponibilidade.

---

# Endpoints Principais

## Auth

```http
POST /auth/login
POST /auth/register
```

---

## Rooms

```http
GET /rooms
POST /rooms
PATCH /rooms/:id
DELETE /rooms/:id
GET /rooms/available
```

---

## Guests

```http
GET /guests
GET /guests/:id
POST /guests
PUT /guests/:id
DELETE /guests/:id
```

---

## Reservations

```http
POST /reservations
GET /reservations
GET /reservations/:id
PATCH /reservations/:id/cancel
PATCH /reservations/:id/check-in
PATCH /reservations/:id/check-out
```

---