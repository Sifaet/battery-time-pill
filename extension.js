import Clutter from 'gi://Clutter';
import St from 'gi://St';
import UPower from 'gi://UPowerGlib';

import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

export default class BatteryTimePillExtension extends Extension {
    enable() {
        const systemIndicator = Main.panel.statusArea.quickSettings?._system;
        const percentageLabel = systemIndicator?._percentageLabel;
        const proxy = systemIndicator?._systemItem?.powerToggle?._proxy;

        if (!systemIndicator || !percentageLabel || !proxy) {
            console.error(`${this.uuid}: Could not find the GNOME battery status indicator`);
            return;
        }

        this._systemIndicator = systemIndicator;
        this._proxy = proxy;
        this._timeLabel = new St.Label({
            text: '',
            style_class: 'panel-label',
            y_align: Clutter.ActorAlign.CENTER,
            y_expand: true,
        });

        const percentageIndex =
            systemIndicator.get_children().indexOf(percentageLabel);
        if (percentageIndex < 0) {
            console.error(`${this.uuid}: Percentage label is not a child of the system indicator`);
            this._timeLabel.destroy();
            this._timeLabel = null;
            this._proxy = null;
            this._systemIndicator = null;
            return;
        }

        systemIndicator.insert_child_at_index(this._timeLabel, percentageIndex + 1);

        this._visibilitySignalId = percentageLabel.connect(
            'notify::visible',
            () => {
                this._timeLabel.visible = percentageLabel.visible;
            }
        );
        this._timeLabel.visible = percentageLabel.visible;

        this._proxySignalId = proxy.connect(
            'g-properties-changed',
            () => this._updateTime()
        );

        this._updateTime();
    }

    disable() {
        if (this._proxy && this._proxySignalId) {
            this._proxy.disconnect(this._proxySignalId);
            this._proxySignalId = null;
        }

        if (this._systemIndicator && this._visibilitySignalId) {
            const percentageLabel = this._systemIndicator._percentageLabel;
            if (percentageLabel)
                percentageLabel.disconnect(this._visibilitySignalId);
            this._visibilitySignalId = null;
        }

        this._timeLabel?.destroy();
        this._timeLabel = null;
        this._proxy = null;
        this._systemIndicator = null;
    }

    _updateTime() {
        if (!this._proxy || !this._timeLabel)
            return;

        if (!this._proxy.IsPresent) {
            this._timeLabel.text = '';
            return;
        }

        let seconds = 0;
        if (this._proxy.State === UPower.DeviceState.CHARGING ||
            this._proxy.State === UPower.DeviceState.PENDING_CHARGE) {
            seconds = this._proxy.TimeToFull;
        } else if (this._proxy.State === UPower.DeviceState.DISCHARGING ||
                   this._proxy.State === UPower.DeviceState.PENDING_DISCHARGE) {
            seconds = this._proxy.TimeToEmpty;
        }

        if (seconds <= 0) {
            this._timeLabel.text = '';
            return;
        }

        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        this._timeLabel.text = ` (${hours}h ${minutes}m)`;
    }
}
