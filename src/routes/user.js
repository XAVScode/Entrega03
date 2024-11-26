const express = require("express");
const userSchema = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const router = express.Router();


// create user
router.post("/users", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email y password son requeridos." });
  }

  try {
    const user = await userSchema.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Usuario no encontrado." });
    }
    console.log("user:", user)
    console.log("user password:", user.password)

    // Comparar las contraseñas
    let isMatch = password === user.password;

    if (!isMatch) {
      isMatch = await bcrypt.compare(password, user.password);
    }


    console.log(isMatch)
    if (!isMatch) {
      return res.status(401).json({ message: "Contraseña incorrecta." });
    }
    const token = jwt.sign({ userId: user._id, email: user.email }, "CLAVE_SUPER_SECRETA", { expiresIn: "1h" });
    res.json({ token });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en el servidor." });
  }
});


// create user
router.post("/users/register", async (req, res) => {
  const { email, password, password_verify } = req.body;
  console.log("registrando")
  console.log(req.body)

  if (!email || !password || !password_verify) {
    return res.status(400).json({ message: "Email y contraseñas son requeridos." });
  }
  if (password !== password_verify) {
    return res.status(400).json({ message: "Las contraseñas no coinciden." });
  }

  try {
    const existingUser = await userSchema.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "El correo electrónico ya está registrado." });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new userSchema({
      email,
      password: hashedPassword,
    });
    await newUser.save();
    const token = jwt.sign({ userId: newUser._id, email: newUser.email }, "CLAVE_SUPER_SECRETA", { expiresIn: "1h" });
    res.status(201).json({ token });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en el servidor." });
  }
});

// get all users
router.get("/users", (req, res) => {
  userSchema
    .find()
    .then((data) => res.json(data))
    .catch((error) => res.json({ message: error }));
});

// get a user
router.get("/users/:id", (req, res) => {
  const { id } = req.params;
  userSchema
    .findById(id)
    .then((data) => res.json(data))
    .catch((error) => res.json({ message: error }));
});

// delete a user
router.delete("/users/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const user = await userSchema.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    res.json({ message: "Usuario eliminado exitosamente." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en el servidor." });
  }
});

// Actualizar usuario
router.put("/users/:id", async (req, res) => {
  const { id } = req.params;
  const { email, password, password_verify } = req.body;
  
  console.log("Actualizando contraseña de:", id);
  console.log("Email:", email);
  console.log("Nueva contraseña:", password);
  console.log("Confirmar contraseña:", password_verify);

  // Validaciones
  if (!email || !password || !password_verify) {
    return res.status(400).json({ message: "Email y contraseñas son requeridos." });
  }
  if (password !== password_verify) {
    return res.status(400).json({ message: "Las contraseñas no coinciden." });
  }

  try {
    // Buscar al usuario por su ID
    const user = await userSchema.findById(id);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    // Verificar si el email proporcionado es el mismo que el registrado en la base de datos
    if (user.email !== email) {
      const existingUser = await userSchema.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "El correo electrónico ya está registrado." });
      }
    }

    // Encriptar la nueva contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Actualizar la contraseña en la base de datos
    user.password = hashedPassword;
    await user.save();

    // Generar un nuevo token
    const token = jwt.sign({ userId: user._id, email: user.email }, "CLAVE_SUPER_SECRETA", { expiresIn: "1h" });

    res.status(200).json({ token });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en el servidor." });
  }
});



module.exports = router;
