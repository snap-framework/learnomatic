define(['jquery'], function ($) {
	'use strict';



	return {

		getTh: function (n) {
			var th;

			if ($("html").attr("lang") !== "fr") {
				if (n == 1) {
					th = "<sup>st</sup>";
				} else if (n == 2) {
					th = "<sup>nd</sup>";
				} else if (n == 3) {
					th = "<sup>rd</sup>";
				} else if (n == 21) {
					th = "<sup>st</sup>";
				} else if (n == 22) {
					th = "<sup>nd</sup>";
				} else if (n == 23) {
					th = "<sup>rd</sup>";
				} else if (n == 31) {
					th = "<sup>st</sup>";
				} else {
					th = "<sup>th</sup>";
				}
			} else {
				if (n == 1) {
					th = "<sup>er</sup>";
				} else {
					th = "";
				}
			}

			return th;
		},

		getMonth: function (n) {
			var month;

			if ($("html").attr("lang") !== "fr") {
				switch (n) {
					case 0:
						month = "January";
						break;
					case 1:
						month = "February";
						break;
					case 2:
						month = "March";
						break;
					case 3:
						month = "April";
						break;
					case 4:
						month = "May";
						break;
					case 5:
						month = "June";
						break;
					case 6:
						month = "July";
						break;
					case 7:
						month = "August";
						break;
					case 8:
						month = "September";
						break;
					case 9:
						month = "October";
						break;
					case 10:
						month = "November";
						break;
					case 11:
						month = "December";
						break;
				}
			} else {
				switch (n) {
					case 0:
						month = "janvier";
						break;
					case 1:
						month = "février";
						break;
					case 2:
						month = "mars";
						break;
					case 3:
						month = "avril";
						break;
					case 4:
						month = "mai";
						break;
					case 5:
						month = "juin";
						break;
					case 6:
						month = "juillet";
						break;
					case 7:
						month = "août";
						break;
					case 8:
						month = "septembre";
						break;
					case 9:
						month = "octobre";
						break;
					case 10:
						month = "novembre";
						break;
					case 11:
						month = "décembre";
						break;
				}
			}

			return month;
		}
	};
});