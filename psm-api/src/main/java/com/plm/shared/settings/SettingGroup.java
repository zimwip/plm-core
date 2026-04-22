package com.plm.shared.settings;

public enum SettingGroup {
    GENERAL("General"),
    PNO("PnO"),
    PLATFORM("Platform"),
    APPLICATION("Application"),
    HELP("Help");

    private final String label;

    SettingGroup(String label) {
        this.label = label;
    }

    public String label() {
        return label;
    }
}
