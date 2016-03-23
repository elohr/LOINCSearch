var gulp = require('gulp');

var util = require('gulp-util');
var sass = require('gulp-sass');
var prefix = require('gulp-autoprefixer');

var browserify = require('browserify');
var reactify = require('reactify');
var source = require('vinyl-source-stream');

// A display error function, to format and make custom errors more uniform
// Could be combined with gulp-util or npm colors for nicer output
var displayError = function(error) {
    // Initial building up of the error
    var errorString = '[' + error.plugin + ']';
    errorString += ' ' + error.message.replace("\n",''); // Removes new line at the end

    // If the error contains the filename or line number add it to the string
    if(error.fileName) {
        errorString += ' in ' + error.fileName;
    }

    if(error.lineNumber) {
        errorString += ' on line ' + error.lineNumber;
    }

    util.log(util.colors.red('Error'), errorString);
};

gulp.task('build', function () {
    var b = browserify({entries: './app.jsx', extensions: ['.jsx'], debug: true});

    return b.transform(reactify)
        .bundle()
        .on('error', function(err){
            displayError(err);
            this.emit("end");
        })
        .pipe(source('bundle.js'))
        .pipe(gulp.dest('dist/js'));
});

gulp.task('sass', function (){
    gulp.src('./styles/**/*.scss')
        .pipe(sass({
            outputStyle: 'compressed',
            sourceComments: 'map'
        }))
        .on('error', function(err){
            displayError(err);
        })
        .pipe(prefix(
            'last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'
        ))
        .pipe(gulp.dest('dist/css'))
});

gulp.task('watch', ['sass', 'build'], function () {
    gulp.watch('./styles/**/*.scss', ['sass']);
    gulp.watch(['*.jsx', './components/*.jsx'], ['build']);
});

gulp.task('default', ['watch']);