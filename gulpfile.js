const { src, dest, parallel, watch } = require("gulp");
const uglify = require("gulp-uglify");
const cleanCSS = require("gulp-clean-css");
const concat = require("gulp-concat");
const sourcemaps = require("gulp-sourcemaps");

const paths = {
    js: {
        firebase: "src/js/firebase/*.js",
        auth: "src/js/auth/*.js",
        calendar: "src/js/calendar/*.js",
        dest: "public/build/",
    },
    css: {
        src: "src/css/*.css",
        dest: "public/build/",
    },
};

function gulpJS(key) {
    return () =>
        src(paths.js[key])
            .pipe(sourcemaps.init())
            .pipe(concat(key + ".js"))
            .pipe(uglify({ mangle: { toplevel: true } }))
            .pipe(sourcemaps.write("./"))
            .pipe(dest(paths.js.dest));
}

function moveJS(key) {
    return () => src(paths.js[key]).pipe(dest(paths.js.dest));
}

function gulpCSS() {
    return src(paths.css.src)
        .pipe(sourcemaps.init())
        .pipe(concat("styles.css"))
        .pipe(cleanCSS())
        .pipe(sourcemaps.write("./"))
        .pipe(dest(paths.css.dest));
}

exports.watch = () => {
    watch(paths.js.firebase, moveJS("firebase"));
    watch(paths.js.auth, gulpJS("auth"));
    watch(paths.js.calendar, gulpJS("calendar"));
    watch("src/**/*.css", gulpCSS);
};

exports.build = parallel(
    moveJS("firebase"),
    gulpJS("auth"),
    gulpJS("calendar"),
    gulpCSS
);
