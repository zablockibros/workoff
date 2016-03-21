import {
  SAMPLE_TYPE
} from 'constants/actionTypes';


const doSampleAction = (val) => {
  return {
    SAMPLE_TYPE,
    val
  };
};

const sampleAction = (val) => dispatch(doSampleAction(val));

export {
  sampleAction
};
