const bcrypt = require("bcryptjs");
const pool = require("../config/db");

const createAdmin = async () => {
    try{
        const name = "System Administrator";
        const email = "admin@storerating.com"
        const address = "System Administration Office";
        const password = "Admin@123";
        
        // Check if admin already exists
        const [existingUsers] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
        
        if(existingUsers.length > 0){
            console.log("Admin already exists.");
            process.exit(0);
        }

        // HAsh password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert admin
        await pool.query(
            `INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, 'ADMIN')`,
            [name, email, hashedPassword, address]
        );
        console.log("Admin created successfully.");
    } catch (error) {
        console.error("Error creating admin:", error);
    } finally {
        await pool.end();
    }
};

createAdmin();


/*
Email:
admin@storerating.com

Password:
Admin@123
*/