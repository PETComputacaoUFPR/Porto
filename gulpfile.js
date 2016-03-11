var gulp = require('gulp');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');

var paths = {
  sass: ['./client/scss/**/*.scss']
};

gulp.task('default', ['sass', 'watch']);

gulp.task('sass', function(done) {
  gulp.src('./client/scss/farol.scss')
    .pipe(sass())
    .pipe(rename({basename: 'style'}))
    .pipe(gulp.dest('./client/public/css/'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({extname: '.min.css' }))
    .pipe(gulp.dest('./client/public/css/'))
    .on('end', done);
});


gulp.task('watch', function() {
  gulp.watch(paths.sass, ['sass']);
});
