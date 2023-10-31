import { colors } from 'assets/Colors';
import React from 'react';
import { View, Text, StyleSheet, Image, ImageSourcePropType, ViewStyle, TextStyle } from 'react-native';
import { scaler } from 'utils';

interface IModeButtonProps {
    borderColor: string;
    backgroundColor: string;
    iconSource: ImageSourcePropType;
    title: string;
    subtitle: string;
}

const DropModeButtons: React.FC<IModeButtonProps> = ({
    borderColor,
    backgroundColor,
    iconSource,
    title,
    subtitle,
}) => {
    return (
        <View style={[styles.receiveBitcoinBtwWrapper, { borderRadius: scaler(10), width: '85%' }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', padding: scaler(10) }}>
                <Image source={iconSource} style={{ height: scaler(50), width: scaler(50), marginLeft: scaler(10) }} />
                <View style={{ marginLeft: scaler(15) }}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.subtitle}>{subtitle}</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    receiveBitcoinBtwWrapper: {
        // borderWidth: 1,
        borderRadius: 10,
        // width: scaler(150),
        alignItems: "flex-start"
    },
    title: {
        fontWeight: '600',
        color: colors.ColorButtonText,
        fontSize: scaler(14),
        marginBottom: scaler(5),
    },
    subtitle: {
        fontWeight: '600',
        color: colors.colorTextPlaceholder,
    },
});

export default DropModeButtons;
