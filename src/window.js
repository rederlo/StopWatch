/* window.js
 *
 * Copyright 2022 Ederlo Rodrigo de Oliveira
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';
import Gio from 'gi://Gio'
import GLib from 'gi://GLib'

export const StopwatchWindow = GObject.registerClass({
    GTypeName: 'StopwatchWindow',
    Template: 'resource:///com/github/rederlo/StopWatch/window.ui',
    InternalChildren: [
        'hours_adjustment',
        'minutes_adjustment',
        'seconds_adjustment',
        'hours_spinbutton',
        'minutes_spinbutton',
        'seconds_spinbutton',
        'stack',
        'start_button',
        'pause_button',
        'stop_button',
        'continue_button',
    ],
}, class StopwatchWindow extends Gtk.ApplicationWindow {
    _init(application) {
        super._init({ application });
        this._application = application;
        this._start_button.connect('clicked', this._startButtonClicked.bind(this));
        this._stop_button.connect('clicked', this._stopButtonClicked.bind(this));
        this._pause_button.connect('clicked', this._pauseButtonClicked.bind(this));
        this._continue_button.connect('clicked', this._continueButtonClicked.bind(this));
    }

    _startButtonClicked() {
        this._start();

        this._seconds = this._getPrepareTimer();

        let timer = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 1, () => {
          if (this._stopTimer) {
            this._setStatusTimer();
            return GLib.SOURCE_REMOVE;
          }

          this._seconds--;

          this._loadValues();

          if (this._seconds > 0)
            return GLib.SOURCE_CONTINUE;

          this._notify();
          this._stop();
          return GLib.SOURCE_REMOVE;
        });
    }

    _stopButtonClicked() {
        this._stop();
    }

    _setStatusTimer(status = true){
        this._stopTimer = status;
    }

    _loadValues(){
        this._hours_adjustment.value = Math.floor(this._seconds / 60 / 60);
        this._minutes_adjustment.value = Math.floor(this._seconds / 60) % 60;
        this._seconds_adjustment.value = this._seconds % 60;
    }

    _getPrepareTimer() {
        if (this._stopTimer) {
          return this._seconds;
        }

        return this._hours_adjustment.value * 60 * 60 +
            this._minutes_adjustment.value * 60 +
            this._seconds_adjustment.value;
    }

    _start(){
        this._setStatusTimer(false);
        this._stack.visible_child_name = 'pause_stop';
        this._hours_spinbutton.sensitive = false;
        this._minutes_spinbutton.sensitive = false;
        this._seconds_spinbutton.sensitive = false;
    }

    _stop(){
        this._setStatusTimer(true);
        this._reset();
        this._stack.visible_child_name = 'start';
        this._hours_spinbutton.sensitive = true;
        this._minutes_spinbutton.sensitive = true;
        this._seconds_spinbutton.sensitive = true;
    }

    _pauseButtonClicked() {
        this._notify('Pausar');
        this._stack.visible_child_name = 'continue';
        this._setStatusTimer();
    }

    _continueButtonClicked() {
        this._notify('Continuar');
        this._startButtonClicked();
    }

    _reset(){
        this._hours_adjustment.value = 0;
        this._minutes_adjustment.value = 0;
        this._seconds_adjustment.value = 0;
    }

    _notify(msg = 'Finalizado') {
      let n = new Gio.Notification();
      n.set_title('Temporizador');
      n.set_priority(Gio.NotificationPriority.HIGH)
      n.set_body(msg);

      this._application.send_notification('com.github.rederlo.StopWatch.Over', n);
    }
});

