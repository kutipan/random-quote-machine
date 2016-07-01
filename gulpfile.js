'use strict';

const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const jade = require('gulp-jade');
const concat = require('gulp-concat');
const imagemin = require('gulp-imagemin');
const sourcemaps = require('gulp-sourcemaps');
const gutil = require('gulp-util');
const iife = require('gulp-iife');


const src = {
	scss: 'scss/*.scss',
	scssPartials: 'scss/partials/*.scss',
	jade: '*.jade',
	jadePartials: 'partials/*jade',
	js: 'js/*.js',
	img: 'images/*'
};

const dist = {
	base: 'dist',
	css: 'dist/css',
	js: 'dist/js',
	img: 'dist/images'
};

// Static Server + watching scss/jade files
gulp.task('serve', ['sass', 'jade', 'javascript', 'images'], function() {
	browserSync.init({
		server: {
			baseDir: dist.base
		},
		browser: "chromium-browser"
	});

	gulp.watch([src.scss, src.scssPartials], ['sass']);
	gulp.watch([src.jade, src.jadePartials], ['jade']);
	gulp.watch(src.js, ['javascript']);
});


// Compile sass into CSS
gulp.task('sass', function() {
	return gulp.src(src.scss)
		.pipe(sourcemaps.init())
		.pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
		.pipe(autoprefixer())
		.pipe(sourcemaps.write('../maps'))
		.pipe(gulp.dest(dist.css))
		.pipe(browserSync.stream({once: true}));
});

// Compile jade into HTML
gulp.task('jade', function() {
	let locals = {title: "Random Quote Generator"};

	return gulp.src(src.jade)
		.pipe(jade({ locals }))
		.pipe(gulp.dest(dist.base))
		.pipe(browserSync.stream({once: true}));
});

// Concat all jscripts
gulp.task('javascript', function() {
	return gulp.src(src.js)
		.pipe(sourcemaps.init())
		.pipe(concat('bundle.js'))
		.pipe(gutil.env.production ? iife() : gutil.noop())
		.pipe(sourcemaps.write('../maps'))
		.pipe(gulp.dest(dist.js))
		.pipe(browserSync.stream({once: true}));
});


// Compress images
gulp.task('images', function () {
	return gulp.src(src.img)
		.pipe(imagemin())
		.pipe(gulp.dest(dist.img));
});


gulp.task('default', ['serve']);
