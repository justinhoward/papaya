'use strict';
var gulp = require('gulp');
var umd = require('gulp-umd');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

var paths = {
    src: './papaya.js',
    dist: './dist'
};

gulp.task('default', ['build']);

gulp.task('build', function() {
    return gulp.src(paths.src)
        .pipe(umd())
        .pipe(gulp.dest(paths.dist))
        .pipe(uglify())
        .pipe(rename({extname: '.min.js'}))
        .pipe(gulp.dest(paths.dist));
});