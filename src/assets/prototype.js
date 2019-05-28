String.prototype.toUTC = function () {
	return this.substring(6, 10) + '-' + this.substring(3, 5) + '-' + this.substring(0,2);
}

String.prototype.fromUTC = function () {
	return this.substring(8, 10) + '/' + this.substring(5, 7) + '/' + this.substring(0,4);
}
