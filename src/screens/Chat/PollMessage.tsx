import { colors } from "assets/Colors";
import { Text } from "custom-components";
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Language from "src/language/Language";
import { scaler } from "utils";

type PollType = {
    question: string;
    options: Array<any>;
    onSelectOption?: () => void;
    pollCompleted: boolean;
    totalVotes: number
    selectedChoice?: number
}
const PollMessage = (props: PollType) => {
    const { question, options, onSelectOption, pollCompleted = false, totalVotes, selectedChoice = -1 } = props
    const [selectedOption, setSelectedOption] = useState(selectedChoice ?? -1);
    return (
        <View style={styles.container}>
            <Text style={styles.questionText} >{question}</Text>

            {pollCompleted ? <View style={styles.row}>
                <Text style={[styles.questionText, { color: colors.colorPrimary }]}>{Language.result}:</Text>
                <Text style={[styles.questionText, { flex: 1, marginLeft: scaler(10) }]}>{Language.total_votes}</Text>
                <Text style={styles.questionText}>{totalVotes}</Text>
            </View> : undefined}

            <View style={{ marginTop: scaler(10) }}>
                {options?.map(_ => {
                    if (pollCompleted) return <View style={[styles.percentView, {
                        borderColor: selectedOption != _?.id && selectedOption != -1 ? colors.colorD : colors.colorPrimary,
                    }]} >
                        <View style={{
                            paddingVertical: scaler(5),
                            paddingHorizontal: scaler(10),
                            width: _?.vote_percent,
                            backgroundColor: selectedOption == _?.id ? colors.colorFadedPrimary : 'rgba(0, 0, 0, 0.05)'
                        }}>
                            <Text style={[styles.optionText, { color: selectedOption == _?.id ? colors.colorPrimary : colors.colorBlackText }]}>{_?.title}</Text>
                        </View>
                        <Text style={[styles.optionText,
                        {
                            color: selectedOption == _?.id ? colors.colorPrimary : colors.colorGreyText,
                            position: 'absolute',
                            right: 10
                        }]}>{_?.vote_percent}</Text>
                    </View>
                    return <TouchableOpacity
                        key={_?.id}
                        style={[styles.optionView,
                        {
                            backgroundColor: selectedOption == _?.id ? colors.colorFadedPrimary : selectedOption == -1 ? colors.colorWhite : 'rgba(0, 0, 0, 0.05)',
                            borderColor: selectedOption != _?.id && selectedOption != -1 ? colors.colorD : colors.colorPrimary,
                        }]}
                        onPress={() => {
                            onSelectOption && onSelectOption();
                            setSelectedOption(_?.id)
                        }}>
                        <Text style={[styles.optionText, { color: selectedOption == _?.id ? colors.colorPrimary : colors.colorBlackText }]}>{_?.title}</Text>
                    </TouchableOpacity>
                })}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.colorWhite,
        borderRadius: scaler(15),
        padding: scaler(10),
        maxWidth: '70%',
        marginLeft: scaler(10),
        marginVertical: scaler(10),
    },
    questionText: {
        fontSize: scaler(12),
        fontWeight: '400',
        color: colors.colorBlackText
    },
    optionView: {
        borderRadius: scaler(5),
        borderWidth: scaler(1),
        borderColor: colors.colorPrimary,
        paddingVertical: scaler(5),
        paddingHorizontal: scaler(10),
        marginBottom: scaler(6)
    },
    optionText: {
        fontSize: scaler(11),
        fontWeight: '400',
        color: colors.colorBlackText
    },
    percentView: {
        backgroundColor: colors.colorWhite,
        // paddingHorizontal: scaler(10),
        // paddingVertical: scaler(5),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: scaler(1),
        marginBottom: scaler(6),
        borderRadius: scaler(5),
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: scaler(10)
    }
})

export default PollMessage;