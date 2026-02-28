import shield from "../assets/markers/shield.png";
import car from "../assets/markers/car.png";
import city from "../assets/markers/city.png";
import leaf from "../assets/markers/leaf.png";
import heart from "../assets/markers/heart.png";
import dots from "../assets/markers/dots.png";
import panic from "../../public/panic.png";

// fallback
import defaultIcon from "../assets/markers/dots.png";

export const markerIcons = {
	"shield-outline": shield,
	car,
	"city-variant-outline": city,
	leaf,
	"heart-pulse": heart,
	"dots-horizontal-circle-outline": dots,
	"shield-alert-outline": panic,
};

export function getMarkerIconByCategory(categoryIcon) {
	return markerIcons[categoryIcon] || defaultIcon;
}
