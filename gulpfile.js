'use strict';

const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const jade = require('gulp-jade');
const concat = require('gulp-concat');
const sourcemaps = require('gulp-sourcemaps');
const gutil = require('gulp-util');
const iife = require('gulp-iife');
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');
const del = require('del');
const runSequence = require('run-sequence');


const src = {
	scss: 'scss/*.scss',
	scssPartials: 'scss/partials/*.scss',
	jade: '*.jade',
	jadePartials: 'partials/*jade',
	js: 'js/*.js'
};

const dist = {
	base: 'dist',
	css: 'dist/css',
	js: 'dist/js'
};

// Static Server + watching scss/jade files
gulp.task('serve', ['sass', 'jade', 'javascript'], function() {
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


gulp.task('default', ['serve']);

gulp.task('clean', function(){
	return del('dist');
});

gulp.task('build', function(callback) {
	runSequence('clean', ['sass', 'jade', 'javascript-pub'], callback);
});

// Make publish-ready
gulp.task('javascript-pub', function() {
	const uglifyOptions = {compress: {drop_console: true}};

	return gulp.src(src.js)
		.pipe(sourcemaps.init())
		.pipe(concat('bundle.js'))
		.pipe(babel({ presets: ['es2015'] }))
		.pipe(iife())
		.pipe(uglify(uglifyOptions))
		.pipe(sourcemaps.write('../maps'))
		.pipe(gulp.dest(dist.js))
		.pipe(browserSync.stream({once: true}));
});

// publish to gh-pages

const ghPages = require('gulp-gh-pages');

gulp.task('publish', ['build'], function() {
	return gulp.src('./dist/**/*')
    .pipe(ghPages());
});
