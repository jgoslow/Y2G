// include gulp
var gulp = require('gulp');
var env = require('./config').env;
var dev = (env == 'development')

// include plug-ins
var jshint = require('gulp-jshint');
var changed = require('gulp-changed');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');
var stripDebug = require('gulp-strip-debug');
var uglify = require('gulp-uglify');
var gulpFilter = require('gulp-filter'); // filter src files for specific operations
var plumber = require('gulp-plumber'); // makes sure watch doesn't break on error
var gulpif = require('gulp-if');

// JS concat, strip debugging and minify
gulp.task('incscripts', function() {
  gulp.src([
        './lib/js/inc/jquery.min.js'
      , './lib/js/inc/tweenmax.js'
      , './lib/js/inc/jquery-ui.js'
      , './lib/js/inc/jquery-form.js'
      , './lib/js/inc/jquery-qtip.min.js'
      , './lib/js/inc/moment.js'
      , './lib/js/inc/parsley.js'
      , './lib/js/inc/parsley.remote.min.js'
      , './lib/js/inc/ganalytics.js'
    ])
    .pipe(plumber({
        errorHandler: function (err) {
            console.log(err);
            this.emit('end');
        }
    }))
    .pipe(concat('concat.inc.js'))
    .pipe(sourcemaps.write())
    .pipe(stripDebug())
    .pipe(uglify({mangle: false}))
    .pipe(gulp.dest('./public/javascripts/'))
})
gulp.task('y2gscripts', function() {
  var filter = gulpFilter(['./lib/js/infobubble.js']); // exclude infobubble from jshint
  gulp.src([
        './lib/js/y2g_functions.js'
      , './lib/js/map_interface.js'
      , './lib/js/infobubble.js'
      , './lib/js/icons.js'
      , './lib/js/analytics.js'
    ])
    .pipe(plumber({
        errorHandler: function (err) {
            console.log(err);
            this.emit('end');
        }
    }))
    .pipe(filter)
    .pipe(jshint({laxcomma:true, asi: true, "-W041": false}))
    .pipe(jshint.reporter('default'))
    .pipe(filter.restore())
    .pipe(concat('concat.y2g.js'))
    .pipe(sourcemaps.write())
    .pipe(gulpif(dev, stripDebug()))
    .pipe(gulpif(dev, uglify({mangle: false})))
    .pipe(gulp.dest('./public/javascripts/'))
})
gulp.task('genscripts', function() {
  gulp.src([
        './lib/js/lyra.js'
      , './lib/js/main.js'
      , './lib/js/responsive.js'
    ])
    .pipe(plumber({
        errorHandler: function (err) {
            console.log(err);
            this.emit('end');
        }
    }))
    .pipe(jshint({laxcomma:true, asi: true, "-W041": false}))
    .pipe(jshint.reporter('default'))
    .pipe(concat('concat.gen.js'))
    .pipe(sourcemaps.write())
    .pipe(gulpif(dev, stripDebug()))
    .pipe(gulpif(dev, uglify({mangle: false})))
    .pipe(gulp.dest('./public/javascripts/'))
})

// Watch Task
var watchList = ['incscripts', 'y2gscripts', 'genscripts']
gulp.task('watch', watchList, function () {
  gulp.watch('./lib/js/**/*.js', watchList);
})



var taskList = ['watch','incscripts', 'y2gscripts', 'genscripts']

gulp.task('default', taskList);
