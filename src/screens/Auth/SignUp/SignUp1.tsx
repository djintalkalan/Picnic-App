import { _checkUsername } from 'api';
import { setLoadingAction } from 'app-store/actions';
import { colors, Images } from 'assets';
import { Button, Stepper, Text, TextInput } from 'custom-components';
import { SafeAreaViewWithStatusBar } from 'custom-components/FocusAwareStatusBar';
import {
  ConfirmPasswordValidations, PasswordValidations
} from 'custom-components/TextInput/rules';
import { upperFirst } from 'lodash';
import React, { FC, useCallback, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Image, StyleSheet, View } from 'react-native';
import { KeyboardAwareScrollView as ScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useDispatch } from 'react-redux';
import Language from 'src/language/Language';
import { NavigationService, scaler } from 'utils';

type FormType = {
  username: string;
  password: string;
  confirmPassword: string;
};

const SignUp1: FC<any> = (props) => {
  const dispatch = useDispatch();

  const [isTerms, setTerms] = useState(true);
  const [isSecure1, setSecure1] = useState(true);
  const [isSecure2, setSecure2] = useState(true);
  const isValidEmail = useRef(false);
  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors, isValid },
    setError,
  } = useForm<FormType>({
    mode: 'onChange',
  });

  // const onSubmit = useCallback(
  //   () =>
  //     handleSubmit(data => {
  //       if (isTerms) {
  //         const { confirmPassword, ...rest } = data;
  //         NavigationService.navigate('SignUp2', rest);
  //       } else {
  //         _showErrorMessage(Language.please_accept_terms);
  //       }
  //     })(),
  //   [isTerms],
  // );

  const onSubmit = useCallback(() => handleSubmit(data => {
    const { username, password, confirmPassword } = data
    dispatch(setLoadingAction(true))
    _checkUsername({ username: username?.trim() }).then(res => {
      if (res?.status == 200) {
        NavigationService.navigate("SignUp2", {
          username: username?.trim(),
          password: password?.trim(),
          ...props?.route?.params,
        })
      } else if (res?.message) {
        setError('username', { message: res?.message });
      }
      dispatch(setLoadingAction(false))
    }).catch(e => {
      console.log("e", e)
      dispatch(setLoadingAction(false))
    })
  })(), []);

  return (
    <SafeAreaViewWithStatusBar style={styles.container}>
      <Stepper isBackButton step={2} totalSteps={4} />
      <ScrollView enableResetScrollToCoords={false} keyboardShouldPersistTaps={'handled'}>
        <View
          style={{
            width: '100%',
            paddingHorizontal: scaler(20),
            paddingVertical: scaler(15),
          }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.welcomeStyle}>{Language.required_information}</Text>
            <Image source={Images.ic_logo_name} style={styles.icon} />
          </View>
          <TextInput
            placeholder={upperFirst(Language.username)}
            required={Language.username_required}
            autoCapitalize={'none'}
            name={'username'}
            style={{ fontSize: scaler(13) }}
            control={control}
            errors={errors}
          />

          <TextInput
            placeholder={Language.password}
            name={'password'}
            rules={PasswordValidations()}
            maxLength={16}
            required={true}
            control={control}
            errors={errors}
            onPressIcon={() => setSecure1(!isSecure1)}
            secureTextEntry={isSecure1}
            icon={isSecure1 ? Images.ic_eye_open : Images.ic_eye_closed}
            iconSize={scaler(18)}
          />

          <TextInput containerStyle={{ height: 0, padding: 0, margin: 0 }} />

          <TextInput
            placeholder={Language.confirm_password}
            name={'confirmPassword'}
            maxLength={16}
            rules={{
              ...ConfirmPasswordValidations(),
              validate: (confirmPassword: string) => {
                if (confirmPassword != getValues('password'))
                  return Language.both_pass_same;
                return true;
              },
            }}
            required={true}
            control={control}
            errors={errors}
            onPressIcon={() => setSecure2(!isSecure2)}
            secureTextEntry={isSecure2}
            icon={isSecure2 ? Images.ic_eye_open : Images.ic_eye_closed}
            iconSize={scaler(18)}
          />

          <Button
            disabled={!isValid}
            containerStyle={{ marginTop: scaler(20) }}
            title={Language.next}
            onPress={onSubmit}
          />

        </View>
      </ScrollView>
    </SafeAreaViewWithStatusBar>
  );
};

export default SignUp1;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.colorWhite,
    justifyContent: 'center',
  },
  icon: {
    height: scaler(27),
    width: scaler(80),
    resizeMode: 'contain',
  },
  welcomeStyle: {
    flex: 1,
    fontSize: scaler(18),
    fontWeight: '600',
  },
  notAMember: {
    alignSelf: 'center',
    fontWeight: '400',
    fontSize: scaler(15),
    marginTop: scaler(20),
    color: colors.colorGreyText,
  },
  iAccept: {
    alignSelf: 'center',
    fontWeight: '500',
    fontSize: scaler(15),
    marginLeft: scaler(10),
    color: colors.colorGreyText,
  },
});
