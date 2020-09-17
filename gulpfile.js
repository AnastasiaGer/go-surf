"use strict";

var gulp = require("gulp");
var plumber = require("gulp-plumber");
var sourcemap = require("gulp-sourcemaps");
var rename = require("gulp-rename");
var sass = require("gulp-sass");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var csso = require("gulp-csso");
var terser = require("gulp-terser");
var server = require("browser-sync").create();
var webp = require("gulp-webp");
var svgstore = require("gulp-svgstore");
var posthtml = require("gulp-posthtml");
var include = require("posthtml-include");
var del = require("del");

gulp.task("css", function () {
  return gulp.src([
    'source/scss/style.scss'
  ])
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(gulp.dest("source/css"))
    .pipe(gulp.dest("public/css"))
    .pipe(csso())
    .pipe(rename("style.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("source/css"))
    .pipe(gulp.dest("public/css"))
    .pipe(server.stream());
});

gulp.task("js", function () {
  return gulp.src([
    'source/js/script.js'
  ])
    .pipe(sourcemap.init())
    .pipe(gulp.dest("source/js"))
    .pipe(gulp.dest("public/js"))
    .pipe(terser())
    .pipe(rename("script.min.js"))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("source/js"))
    .pipe(gulp.dest("public/js"))
    .pipe(server.stream());
});

gulp.task("server", function () {
  server.init({
    server: "public/",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch("source/scss/**/*.scss", gulp.series("css"));
  gulp.watch("source/*.html").on("change", server.reload);
  gulp.watch(("source/img/icon-*.svg"), gulp.series("sprite", "html", "refresh"));
  gulp.watch(("source/*.html"), gulp.series("html", "refresh"));
});

gulp.task("webp", function () {
  return gulp.src("source/img/*.{jpg}")
    .pipe(webp({quality: 90}))
    .pipe(gulp.dest("source/img"));
});

gulp.task("sprite", function () {
  return gulp.src("source/img/icon-*.svg")
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("public/img"));
});

gulp.task("html", function () {
  return gulp.src("source/*.html")
    .pipe(posthtml([
      include()
    ]))
    .pipe(gulp.dest("public"));
});

gulp.task("minify", function() {
  return gulp.src("source/*.html")
    .pipe(gulp.dest("public"))
});

gulp.task("copy", function() {
  return gulp.src([
    "source/fonts/**/*.{woff,woff2}",
    "source/img/**",
    "source/js/*.js",
    "source/css/*.css"
  ], {
    base: "source"
  })
    .pipe(gulp.dest("public"));
});

gulp.task("clean", function () {
  return del("public");
});

gulp.task("public", gulp.series(
  "clean",
  "copy",
  "css",
  "js",
  "webp",
  "sprite",
  "html",
  "minify"
));

gulp.task("refresh", function (done) {
  server.reload();
  done();
});

gulp.task("start", gulp.series(
  "clean",
  "copy",
  "css",
  "js",
  "sprite",
  "html",
  "minify",
  "server"
));
