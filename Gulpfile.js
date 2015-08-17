'use strict';
var pkg = require('./package');
var gulp = require('gulp');
var umd = require('gulp-umd');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var zip = require('gulp-zip');
var tar = require('gulp-tar');
var gzip = require('gulp-gzip');

var paths = {
    src: './papaya.js',
    dist: './dist',
    release: './release',
    release_files: ['./README.md', './LICENSE.txt', './bower.json', './dist/*'],
    release_zip: pkg.name + '-' + pkg.version + '.zip',
    release_tar: pkg.name + '-' + pkg.version + '.tar'
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

gulp.task('release', ['release-tar', 'release-zip']);

gulp.task('release-tar', function() {
    return gulp.src(paths.release_files)
        .pipe(tar(paths.release_tar))
        .pipe(gzip())
        .pipe(gulp.dest(paths.release));
});

gulp.task('release-zip', function() {
    return gulp.src(paths.release_files)
        .pipe(zip(paths.release_zip))
        .pipe(gulp.dest(paths.release));
});
