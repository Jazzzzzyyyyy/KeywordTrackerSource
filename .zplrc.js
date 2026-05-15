module.exports = {
	out: "./release",
	copyToBD: !process.env.CI,
	addInstallScript: true
}
