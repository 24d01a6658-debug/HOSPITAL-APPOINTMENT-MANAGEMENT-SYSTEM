const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config();

const Appointment = require("./models/Appointment");
const User = require("./models/User");

const app = express();
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected successfully!");
    })
    .catch((error) => {
        console.log("MongoDB connection failed:");
        console.log(error.message);
    });

const PORT = 5000;

// Read JSON data
app.use(express.json());

// Serve HTML, CSS and JS files
app.use(express.static(path.join(__dirname, "public")));

// Appointment API
app.post("/api/appointments", async (req, res) => {

    try {

        const lastAppointment = await Appointment.findOne({
    doctor: req.body.doctor,
    date: req.body.date
}).sort({ tokenNumber: -1 });

const nextToken = lastAppointment
    ? lastAppointment.tokenNumber + 1
    : 1;

const appointment = new Appointment({
    ...req.body,
    tokenNumber: nextToken
});

        await appointment.save();

        console.log("Appointment saved to MongoDB:");
        console.log(appointment);

        res.json({
    success: true,
    message: "Appointment booked successfully!",
    tokenNumber: nextToken
});
    } catch (error) {

        console.log("Error saving appointment:");
        console.log(error.message);

        res.status(500).json({
            success: false,
            message: "Failed to save appointment."
        });

    }

});

// Get all registered patients
app.get("/api/users", async (req, res) => {
    try {
        const users = await User.find();

        res.json(users);

    } catch (error) {

        console.log("Error fetching users:");
        console.log(error.message);

        res.status(500).json({
            message: "Failed to fetch users."
        });
    }
});

// Get all appointments
app.get("/api/appointments", async (req, res) => {

    try {

        const appointments = await Appointment.find();

        res.json(appointments);

    } catch (error) {

        console.log("Error fetching appointments:");
        console.log(error.message);

        res.status(500).json({
            message: "Failed to fetch appointments."
        });

    }

});

// Update appointment status
app.put("/api/appointments/:id", async (req, res) => {

    try {

        const appointment =
            await Appointment.findByIdAndUpdate(
                req.params.id,
                { status: req.body.status },
                { new: true }
            );

        if (!appointment) {

            return res.status(404).json({
                message: "Appointment not found."
            });

        }

        res.json({
            success: true,
            message: `Appointment ${req.body.status.toLowerCase()} successfully!`
        });

    } catch (error) {

        console.log("Error updating appointment:");
        console.log(error.message);

        res.status(500).json({
            success: false,
            message: "Failed to update appointment."
        });

    }

});

// Patient registration
app.post("/api/register", async (req, res) => {

    try {

        const { name, email, password, phone } = req.body;

        const existingUser = await User.findOne({ email });

        if (existingUser) {

            return res.status(400).json({
                success: false,
                message: "Email is already registered."
            });

        }

        const user = new User({
            name,
            email,
            password,
            phone
        });

        await user.save();

        res.json({
            success: true,
            message: "Registration successful!"
        });

    } catch (error) {

        console.log("Registration error:");
        console.log(error.message);

        res.status(500).json({
            success: false,
            message: "Registration failed."
        });

    }

});
// Patient Login
app.post("/api/login", async (req, res) => {

    try {

        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {

            return res.status(401).json({
                success: false,
                message: "Email not registered."
            });

        }

        if (user.password !== password) {

            return res.status(401).json({
                success: false,
                message: "Incorrect password."
            });

        }

        res.json({
            success: true,
            message: "Login successful! Welcome " + user.name
        });

    } catch (error) {

        console.log("Login error:");
        console.log(error.message);

        res.status(500).json({
            success: false,
            message: "Login failed."
        });

    }

});
// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});