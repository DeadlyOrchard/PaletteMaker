class Hexcode {
    constructor(r, g, b) {
        this.setColorByHex(r, g, b);
    }

    getHexStr() {
        return this.hexStr;
    }

    getHexArr() {
        return this.hexArr;
    }

    getRgbStr() {
        return this.rgbStr;
    }

    getRgbArr() {
        return this.rgbArr;
    }

    setColorByHex(r, g, b) {
        // r, g, b are all 2 digit hex codes that correspond to the red, green, and blue channels
        // Hexcode will store it's corresponding RGB, HSV, and HSL code
        this.hexArr = [r, g, b];
        this.hexStr = "#" + r + g + b;

        let rgb = [0, 0, 0]; // to be calculated
        // process r, g, and b channels separately
        for (let i = 0; i < rgb.length; i++)
            rgb[i] = base16to10(this.hexArr[i]);

        this.rgbArr = rgb;

        // turn ints into str for css purposes
        let sRGB = "";
        for (let i = 0; i < 3; i++)
            sRGB += rgb[i].toString() + ", "; // rgb is an array of the r, g, and b channels in that order.

        this.rgbStr = sRGB.substring(0, sRGB.length - 2); // remove the last comma and space that was added in for loop
    }

    setColorByRGB(r, g, b) {
        // set hex values
        let rgb = [r, g, b];
        let hexArr = [];
        for (let i = 0; i < rgb.length; i++) {
            hexArr.push(base10to16(rgb[i]));
        }

        this.hexArr = hexArr;
        this.hexStr = "#" + hexArr[0] + hexArr[1] + hexArr[2];

        // set rgb values
        this.rgbArr = [r, g, b];
        let sRGB = "";
        for (let i = 0; i < 3; i++)
            sRGB += rgb[i].toString() + ", ";

        this.rgbStr = sRGB.substring(0, sRGB.length - 2);
    }
}

function base16to10(num) {
    // num should be a 2 digit hexstring
    chars = new Set();
    for (let i = 97; i < 103; i++)
        chars.add(String.fromCharCode(i)); // chars a-f

    let prods = []
    exponent = 0;
    for (let i = num.length - 1; i >= 0; i--) {
        if (chars.has(num[i]))
            prods.push((num[i].charCodeAt(0) - 87) * Math.pow(16, exponent)); // turn a letter a-f into a number 10-15 from charcode
        else
            prods.push(parseInt(num[i]) * Math.pow(16, exponent));
        exponent++;
    }
    return prods[0] + prods[1];
}

function base10to16(num) {
    // num should be <= 255
    let quotient1 = Math.floor(num / 16);
    let remainders = [num % 16, quotient1 % 16];

    let result = "";
    for (let i = remainders.length - 1; i >= 0; i--) {
        if (remainders[i] > 9)
            result += String.fromCharCode(remainders[i] + 87);
        else
            result += remainders[i].toString();
    }
    return result;
}

class Color {
    constructor(hexcode, paletteIndex) {
        this.base_html =
        `<div class="color" style="background-color: rgb(${hexcode.getRgbStr()})"><p>`; // definitely starts with this. The rest depends on viewstate
        this.colorValue = hexcode;
        this.buttons =
        `
        <button onclick=selectColor(${paletteIndex})>Edit</button>
        <button onclick=copyColor(${paletteIndex})>Copy</button>
        `;
        this.selected = false;
    }
    getFullHTML(viewstate) {
        switch (viewstate) {
            case 0:
                return this.base_html + this.colorValue.getRgbStr() + "</p>" + this.buttons + "</div>";
                break;
            case 1:
                return this.base_html + this.colorValue.getHexStr() + "</p>" + this.buttons + "</div>";
                break;
        }
    }
    getHTMLContents(viewstate) {
        switch (viewstate) {
            case 0:
                return "<p>" + this.colorValue.getRgbStr() + "</p>" + this.buttons;
                break;
            case 1:
                return "<p>" + this.colorValue.getHexStr() + "</p>" + this.buttons;
                break;
        }
    }
    getColorValue() {
        return this.colorValue;
    }

    setColorValueByHex(r, g, b) {
        // values received as hexchars in separate rgb channels
        this.colorValue.setColorByHex(r, g, b);
        this.base_html =
        `<div class="color" style="background-color: rgb(${this.colorValue.getRgbStr()})"><p>`;
    }

    setColorValueByRGB(r, g, b) {
        this.colorValue.setColorByRGB(r, g, b);
        this.base_html =
        `<div class="color" style="background-color: rgb(${this.colorValue.getRgbStr()})"><p>`;
    }

    select() {
        this.selected = true;
    }
    deselect() {
        this.selected = false;
    }
    isSelected() {
        return this.selected;
    }
}

function setViewState(state) {
    viewstate = state;
    DOM_palette.innerHTML = "";
    for (let i = 0; i < colorPalette.length; i++)
        DOM_palette.innerHTML += colorPalette[i].getFullHTML(viewstate);

}

function createRandomColor(parent) {
    hexChars = {0: "0", 1: "1", 2: "2", 3: "3", 4: "4", 5: "5", 6: "6", 7: "7", 8: "8", 9: "9", 10: "a", 11: "b", 12: "c", 13: "d", 14: "e", 15: "f"};
    let r = hexChars[Math.round(Math.random() * 15)] + hexChars[Math.round(Math.random() * 15)];
    let g = hexChars[Math.round(Math.random() * 15)] + hexChars[Math.round(Math.random() * 15)];
    let b = hexChars[Math.round(Math.random() * 15)] + hexChars[Math.round(Math.random() * 15)];
    randomColor = new Color(new Hexcode(r, g, b), colorPalette.length);
    DOM_palette.innerHTML += randomColor.getFullHTML(0);
    colorPalette.push(randomColor);
}

function setupColors() {
    for (let i = 0; i < 10; i++)
        createRandomColor();
}

function selectColor(paletteIndex) {
    // apply styling
    if (document.getElementById("selected") != null)
        document.getElementById("selected").removeAttribute("id");
    DOM_color = document.getElementsByClassName("color")[paletteIndex];
    DOM_color.setAttribute("id", "selected");

    // populate input fields and set them according to viewstate
    let color = colorPalette[paletteIndex];
    for (let i = 0; i < colorPalette.length; i++)
        colorPalette[i].deselect();
    
    color.select();
    
    switch(viewstate) {
        case 0:
            for (let i = 0; i < 3; i++) {
                sliders[i].max = 255;
                sliders[i].min = 0;
                sliders[i].value = color.getColorValue().getRgbArr()[i];
                inputs[i].innerHTML = color.getColorValue().getRgbArr()[i];
            }
            break;
        case 1:
            for (let i = 0; i < 3; i++) {
                sliders[i].max = 255;
                sliders[i].min = 0;
                sliders[i].value = color.getColorValue().getRgbArr()[i];
                inputs[i].innerHTML = color.getColorValue().getHexArr()[i];
            }
            break;
    }
}

function editColor() {
    DOM_color = document.getElementById("selected");

    for (let i = 0; i < inputs.length; i++) {
        switch(viewstate) {
            case 0:
                inputs[i].innerHTML = sliders[i].value;
                break;
            case 1:
                inputs[i].innerHTML = base10to16(sliders[i].value);
        }
    }

    for (let i = 0; i < colorPalette.length; i++) {
        if (colorPalette[i].isSelected()) {
            let color = colorPalette[i];
            switch(viewstate) {
                case 0:
                    color.setColorValueByRGB(sliders[0].value, sliders[1].value, sliders[2].value);
                    DOM_color.innerHTML = color.getHTMLContents(viewstate);
                    DOM_color.style.backgroundColor = `rgb(${color.getColorValue().getRgbStr()})`;
                    break;
                case 1:
                    color.setColorValueByHex(inputs[0].innerHTML, inputs[1].innerHTML, inputs[2].innerHTML);
                    DOM_color.innerHTML = color.getHTMLContents(viewstate);
                    DOM_color.style.backgroundColor = `rgb(${color.getColorValue().getRgbStr()})`;
                    break;
            }
            break;
        }
    }
}

function copyColor(paletteIndex) {
    // after selecting a color, inputs are set to that color's values
    let color = colorPalette[paletteIndex];
    switch(viewstate) {
        case 0:
            navigator.clipboard.writeText("(" + color.getColorValue().getRgbStr() + ")");
            break;
        case 1:
            navigator.clipboard.writeText(color.getColorValue().getHexStr());
            break;
    }
    
}

// globals
let DOM_palette = document.getElementById("palette");
let viewstate = 0; // contextual viewing state to adjust what is displayed for each color
let colorPalette = []; // to allowing editing of each color
let sliders = [document.getElementById("slider1"), document.getElementById("slider2"), document.getElementById("slider3")];
let inputs = [document.getElementById("input1"), document.getElementById("input2"), document.getElementById("input3")];

window.onload = setupColors();