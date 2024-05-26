const userService = require("../service/userService");

const getAllUsers = async (req, res) => {
    try {
        const obj = await userService.getAllUsers();
        res.send(obj);
    } catch (error) {
        console.error("Error while getting all users:", error);
        res.status(500).send("Internal Server Error");
    }
};

module.exports = {
    getAllUsers
}