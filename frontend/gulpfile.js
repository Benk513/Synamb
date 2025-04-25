// var gulp = require('gulp');
// const sass = require('gulp-sass')(require('sass'));
// postcss = require("gulp-postcss");
// autoprefixer = require("autoprefixer");
// var sourcemaps = require('gulp-sourcemaps');
// var browserSync = require('browser-sync').create();
// cssbeautify = require('gulp-cssbeautify');
// var beautify = require('gulp-beautify');


// //_______ task for scss folder to css main style 
// gulp.task('watch', function () {
//     console.log('Command executed successfully compiling SCSS in assets.');
//     return gulp.src('sash/assets/scss/**/*.scss')
//         .pipe(sourcemaps.init())
//         .pipe(sass())
//         .pipe(sourcemaps.write(''))
//         .pipe(beautify.css({ indent_size: 4 }))
//         .pipe(gulp.dest('sash/assets/css'))
//         .pipe(browserSync.reload({
//             stream: true
//         }))
// })


var gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
postcss = require("gulp-postcss");
autoprefixer = require("autoprefixer");
var sourcemaps = require('gulp-sourcemaps');
var browserSync = require('browser-sync').create();
cssbeautify = require('gulp-cssbeautify');
var beautify = require('gulp-beautify');

// _______ Task for SCSS folder to CSS main style and browser sync
gulp.task('sass-watch', function () {
    console.log('Command executed successfully compiling SCSS in assets and syncing with browser.');
    return gulp.src('sash/assets/scss/**/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(postcss([autoprefixer()])) // Add autoprefixer for browser compatibility
        .pipe(sourcemaps.write('.')) // Write sourcemaps relative to the CSS file
        .pipe(cssbeautify({ // Use cssbeautify for well-formatted CSS
            indent: '    ',
            openbrace: 'end-of-line',
            closebrace: 'end-of-line'
        }))
        .pipe(gulp.dest('sash/assets/css'))
        .pipe(browserSync.stream()); // Use .stream() for efficient updates
});

// _______ Task to initialize browser sync
gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: './sash' // Adjust the base directory to your project root
        }
    });
});

// _______ Task to watch for changes in SCSS, HTML, and JS files and trigger corresponding tasks
gulp.task('watch', function () {
    gulp.watch('sash/assets/scss/**/*.scss', gulp.series('sass-watch'));
    gulp.watch('sash/**/*.html').on('change', browserSync.reload); // Reload on HTML changes
    gulp.watch('sash/assets/js/**/*.js').on('change', browserSync.reload);   // Reload on JS changes
});

// _______ Default task to run all necessary tasks for development
gulp.task('default', gulp.series('browser-sync', 'sass-watch', 'watch'));
