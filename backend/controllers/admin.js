import Admin from '../models/admin.js';

export const adminRegister = async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await Admin.findOne({ email });
        if (admin) {
            return res.status(400).json({ message: "Admin already exists" });
        }
        const newAdmin = new Admin({ email, password });
        await newAdmin.save();
        res.status(201).json({ message: "Admin registered successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(401).json({ success: false, message: "Admin not found" });
        }
        if (admin.password !== password) {
            return res.status(401).json({ success: false, message: "Incorrect password" });
        }
        res.status(200).json({ success: true, message: "Admin logged in successfully", admin: { email: admin.email } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
