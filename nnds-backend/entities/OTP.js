import { EntitySchema, JoinColumn } from "typeorm";

const OTP = new EntitySchema({
    name: 'OTP',
    tableName: 'Otps',
    columns: {
        id: {
            primary: true,
            type: 'uniqueidentifier',
            generated: "uuid"
        },
        u_id: {
            type: 'uniqueidentifier'
        },
        otp_code: {
            type: "int",
            nullable: false
        },
        created_at: {
            type: 'datetime',
            createDate: true
        }
    },
    relations: {
        user: {
            type: 'many-to-one',
            target: 'User',
            joinColumn: {
                name: 'u_id'
            },
            inverseSide: 'otp'
        }
    }
})
export default OTP