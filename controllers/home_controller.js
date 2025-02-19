module.exports.home = function (req, res) {
    console.log("🟢 Rendering home.ejs with title: Home Page"); // Debugging log
    return res.render('home', {
        title: "Home Page" // ✅ Ensure this is being passed
    });
};


