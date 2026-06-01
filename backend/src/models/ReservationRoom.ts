import { DataTypes, Model } from "sequelize";
import database from "../config/database";

class ReservationRoom extends Model {}

ReservationRoom.init(
  {
    reservationId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    roomId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    sequelize: database,
    tableName: "reservation_rooms",
  }
);

export default ReservationRoom;