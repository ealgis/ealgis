var gulp = require('gulp');
var browserify = require('browserify');
var watchify = require("watchify");
var source = require('vinyl-source-stream');
var tsify = require('tsify');
var gutil = require("gulp-util");
var sourcemaps = require('gulp-sourcemaps');
var buffer = require('vinyl-buffer');
var paths = {
    pages: ['src/*.html']
};

var watchedBrowserify = watchify(browserify({
    basedir: '.',
    debug: true,
    entries: ['./src/index.tsx'],
    cache: {},
    packageCache: {}
}, {
    poll: true,
}).plugin(tsify));

function bundle() {
    return watchedBrowserify
    .plugin(tsify)
    .transform('babelify', {
        presets: ['es2015'],
        extensions: ['.ts']
    })
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('dist'));
};

gulp.task("default", [], bundle);
watchedBrowserify.on("update", bundle);
watchedBrowserify.on("log", gutil.log);
