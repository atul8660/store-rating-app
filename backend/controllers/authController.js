const bcrypt = require("bcryptjs");
const pool = require("../config/db");
const jwt = require("jsonwebtoken");

const signup = async(req, res) => {
    try{
        const {name , email, address, password} = req.body;

        // check required fields
        if(!name || !email || !address || !password){
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // Name validation
        if(name.length < 20 || name.length > 60){
            return res.status(400).json({
                success: false,
                message: "Address must not exceed 400 characters"
            });
        }

        // Password validation
         const passwordRegex =
            /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

        if(!passwordRegex.test(password)){
            return res.status(400).json({
                success: false,
                message: "password must be 8-16 characters and contain at least one uppercase letter and one special character"
            });
        }

        // Check whether email already exists
        const [existingUsers] = await pool.query("SELECT id FROM users WHERE email =?", [email]);

        if(existingUsers.length > 0){
            return res.status(409).json({
                success: false,
                message: "Email is already registered"
            });
        }

        //hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // create normal user
        const [result] = await pool.query(
            `INSERT INTO users(name, email, password, address, role) VALUES(?, ?, ?, ?, 'USER')`,
            [name, email, hashedPassword, address]
        );

        res.status(201).json({
            success: true,
            message: "USER registered successfully",
            userId: result.insertId
        });
    } catch (error) {
        console.error("Signed error:", error);

        res.status(500).json({
            success: false,
            message: "Server error during signup"
        });
    }
};


const login = async(req,res) => {
    try{
        const{email, password} = req.body;

        // check requored fields
        if(!email || !password){
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        // find user by email
        const[users] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);

        if(users.length === 0){
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const user = users[0];

        // Compare password with stores hash
        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );

        if(!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Create JWT 
        const token = jwt.sign(
            {
                userId: user.id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user:{
                id: user.id,
                name: user.name,
                email: user.email,
                address: user.address,
                role: user.role
            }
        });
    } catch (error) {
        console.error("Login error:", error);   

        res.status(500).json({
            success: false,
            message: "Server error during login"
        });
    }

};

module.exports = { signup, login };