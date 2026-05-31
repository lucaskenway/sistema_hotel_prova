import { DataTypes, Model } from "sequelize";
import database from "../config/database";

class Reservation extends Model {}

Reservation.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    checkIn: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    checkOut: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize: database,
    tableName: "reservations",
  }
);

export default Reservation;