const homePage = (req, res) => {
    res.json({
        user: req.user,
        message: 'Welcome to dashboard'
    })
}

module.exports = { homePage }
