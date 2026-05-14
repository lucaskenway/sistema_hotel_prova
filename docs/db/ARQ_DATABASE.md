# Banco de Dados

## Banco Escolhido

PostgreSQL.

## ORM Escolhido

Sequelize ORM.

---

# Entidades (Modelagem Normalizada)

Para garantir integridade, redução de redundância e adequação às Formas Normais (1FN, 2FN, 3FN), a estrutura do banco de dados está normalizada da seguinte maneira:

### 1. User
Representa os funcionários do sistema (ex: administradores, recepcionistas).
- `id`: UUID (Primary Key)
- `name`: String
- `email`: String (Unique)
- `password`: String
- `role`: Enum ('ADMIN', 'RECEPTIONIST')
- `createdAt`, `updatedAt`: Timestamps

### 2. RoomCategory
Separa os atributos de tipos de quarto da entidade física para evitar redundância de dados (3FN).
- `id`: UUID (Primary Key)
- `name`: String (ex: 'Standard', 'Suite')
- `capacity`: Integer
- `pricePerNight`: Decimal
- `createdAt`, `updatedAt`: Timestamps

### 3. Room
Representa o quarto físico do hotel.
- `id`: UUID (Primary Key)
- `number`: String (Unique)
- `floor`: Integer
- `status`: Enum ('AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'CLEANING')
- `categoryId`: UUID (Foreign Key -> RoomCategory)
- `createdAt`, `updatedAt`: Timestamps

### 4. Guest
Representa os hóspedes.
- `id`: UUID (Primary Key)
- `fullName`: String
- `cpf`: String (Unique)
- `phone`: String
- `email`: String (Unique)
- `createdAt`, `updatedAt`: Timestamps

### 5. Reservation
Registra as reservas. Inclui o `totalAmount` para manter histórico financeiro caso os preços das categorias mudem no futuro.
- `id`: UUID (Primary Key)
- `checkInDate`: Date
- `checkOutDate`: Date
- `status`: Enum ('PENDING', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED')
- `totalAmount`: Decimal
- `guestId`: UUID (Foreign Key -> Guest)
- `roomId`: UUID (Foreign Key -> Room)
- `userId`: UUID (Foreign Key -> User) - Usuário que registrou a reserva
- `createdAt`, `updatedAt`: Timestamps

---

# Relacionamentos

```txt
RoomCategory 1:N Room
Guest 1:N Reservation
Room 1:N Reservation
User 1:N Reservation
```

---

# Objetivos Acadêmicos

O projeto busca demonstrar:

* APIs REST;
* modelagem relacional;
* autenticação;
* Docker;
* Docker Swarm;
* infraestrutura moderna;
* backend com Node.js;
* persistência de dados (usando Sequelize ORM);
* escalabilidade básica.

---

# Roadmap Resumido

## Fase 1

* setup Docker;
* PostgreSQL;
* Express.

---

## Fase 2

* Sequelize ORM;
* autenticação JWT.

---

## Fase 3

* CRUD hóspedes;
* CRUD quartos.

---

## Fase 4

* reservas;
* regras de negócio.

---

## Fase 5

* Swagger;
* testes;
* documentação.

---

## Fase 6

* Docker Swarm;
* Kubernetes (complementar).

---