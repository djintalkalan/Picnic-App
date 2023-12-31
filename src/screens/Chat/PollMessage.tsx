import { colors } from "assets/Colors";
import { Text } from "custom-components";
import { useDatabase } from 'database';
import { round } from "lodash";
import React, { useMemo, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { EMIT_CAST_VOTE, SocketService } from "socket";
import Language from "src/language/Language";
import { dateFormat, scaler } from "utils";

type PollType = {
    [key: string]: any
}
const PollMessage = (props: PollType) => {

    const { poll, isGroupType, _id: message_id, group, poll_submitted_by_users, containerStyle, poll_result, itemType } = props
    const { question, options, poll_type, poll_ends_on } = poll || {}
    const [userData] = useDatabase('userData')

    const isPollEnded = poll?.result_declared == 1 || new Date() > new Date(poll_ends_on)

    const submittedAnswer = useMemo(() => {
        const castedVote = poll_submitted_by_users?.find((_: any) => _?.user_id == userData?._id)
        return castedVote?.selected_option || ''
    }, [poll_submitted_by_users])

    const [selectedOption, setSelectedOption] = useState(submittedAnswer);

    const onCastVote = (vote: string) => {
        SocketService.emit(EMIT_CAST_VOTE, {
            message_id: message_id,
            vote,
            resource_id: group?._id,
            resource_type: isGroupType ? 'group' : 'event'
        })
    }

    return (
        <View style={[styles.container, containerStyle ? StyleSheet.flatten(containerStyle) : undefined]}>
            <Text style={styles.questionText} >{question}</Text>
            {poll_result ? <View style={styles.row}>
                <Text style={[styles.questionText, { color: colors.colorPrimary }]}>{Language.result}:</Text>
                <Text style={[styles.questionText, { flex: 1, marginLeft: scaler(10) }]}>{Language.total_votes}</Text>
                <Text style={styles.questionText}>{poll_result?.total_votes}</Text>
            </View> : undefined}

            <View style={{ marginTop: scaler(10) }}>
                {options?.map((_: string) => {
                    if (poll_result) {
                        const percentage = round((poll_result?.options?.[_] * 100) / (poll_result?.total_votes || 1), 2)
                        return <View key={_} style={[styles.percentView, {
                            paddingVertical: scaler(5),
                            borderColor: selectedOption != _ && selectedOption ? colors.colorD : colors.colorPrimary,
                        }]} >
                            <View style={{
                                width: `${percentage || 5}%`,
                                position: 'absolute',
                                top: 0,
                                bottom: 0,
                                backgroundColor: colors.colorFadedPrimary,
                            }} />
                            <Text style={[styles.optionText, {
                                color: colors.colorPrimary,
                                marginHorizontal: scaler(5),
                                flex: 1,
                            }]}>{_}</Text>
                            <Text style={[styles.optionText,
                            {
                                color: colors.colorPrimary,
                                marginRight: scaler(5),
                            }]}>{`${percentage}%`}</Text>
                        </View>
                    }
                    return <TouchableOpacity
                        key={_}
                        disabled={itemType == 'muted' || isPollEnded}
                        style={[styles.optionView,
                        {
                            backgroundColor: selectedOption == _ ? colors.colorFadedPrimary : !selectedOption ? colors.colorWhite : 'rgba(0, 0, 0, 0.05)',
                            borderColor: selectedOption && selectedOption != _ ? colors.colorD : colors.colorPrimary,
                        },
                        !selectedOption && isPollEnded ? styles.disableButtonStyle : {}
                        ]}
                        onPress={() => {
                            let vote = ''
                            if (!selectedOption || _ != selectedOption) {
                                vote = _
                            }
                            onCastVote(vote)
                            setSelectedOption(vote)
                        }}>
                        <Text style={[styles.optionText, { color: selectedOption == _ ? colors.colorPrimary : colors.colorBlackText }]}>{_}</Text>
                    </TouchableOpacity>
                })}
            </View>
            {!poll_result ? <Text style={styles.endOnText} >{isPollEnded ? Language.poll_ended : (Language.ends_on + " " + dateFormat(new Date(poll_ends_on), "MMM DD, YYYY") + " " + Language.at + " " + dateFormat(new Date(poll_ends_on), "hh:mm A"))?.replace(dateFormat(new Date(), ', YYYY'), '')} </Text> : undefined}
        </View>
    )
}
const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.colorWhite,
        borderRadius: scaler(15),
        padding: scaler(10),
        width: '70%',
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
    },
    endOnText: {
        fontSize: scaler(10),
        color: colors.colorErrorRed
    },
    disableButtonStyle: {
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        borderColor: colors.colorD,
    }
})

export default PollMessage;