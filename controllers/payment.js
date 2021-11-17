const axios = require("axios");
const User = require("../model/user");
const account = require('accounting');
let myFunc;
let amount;

exports.PayMe = async (req, res, next) => {
  const { response, phoneNumber } = req.body;
  if (response && phoneNumber ) {
    const initUser = await User.findOne({ phone: phoneNumber});
    let checkInit = false;
    if(initUser?.stage == null || initUser.stage === undefined || initUser.stage === "" || initUser.stage === 1){
      checkInit = true
    }
    if (
      response?.toLowerCase() === "payment" &&
      /^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[-\s\./0-9]*$/g.test(phoneNumber) && checkInit
    ) {
      try {
        const data = await axios.post(
          "https://sellbackend.creditclan.com/parent/index.php/globalrequest/get_payment__order",
          { phone: phoneNumber }
        );
        if (!data.data.status)
          return res.json({
            message: "There are no request payment for this number",
          });
        if (data) {
          let user_phone = data.data.order.find(({ phone }) => phone);
          amount = user_phone.amount;
          let checkUser = await User.findOne({phone:phoneNumber});
          if(!checkUser){
            let saveUser= new User({phone: phoneNumber, stage:1, qty:1});
            await saveUser.save()
          }
        if(data.data.order.length > 1){
          checkUser.qty = data.data.order.length;
          checkUser.stage = 2;
          checkUser.save();
          let ordersValue = '';
          data.data.order.forEach((element,index)=> {
            ordersValue += `*[${index+1}]* ${element.description} for ${account.formatMoney(element.amount,'₦')} \n`
          });
           return res.status(200).json({message:`Welcome 😃! This service allows to fulfil a payment to a merchant. \n we found the following order for you,select one to pay for  \n ${ordersValue}`})

        }else{
          let checkUser55 = await User.findOne({phone:phoneNumber});
          checkUser55.stage = 3;
          checkUser55.save(); 
           return res.status(200).json({ message: `Welcome 😃! This service allows to fulfil a payment to a merchant. \n We have found  payment request for you. \n *amount* ${account.formatMoney(data.data.order[0].amount,'₦')} 💰 \n *merchant_name* ${data.data.order[0].merchant_name} \n *desc* ${data.data.order[0].description} \n *picture* ${data.data.order[0].picture} \n  \n kindly enter 👇 \n *[1]* To Make Payment \n *[2]* To Decline`
          })
        } 
        }
      } catch (error) {
        return res.status(500).json("Network issues... kindly try again 😋");
      }
    } else if(Number(response) > 0 && Number(response) <= initUser?.qty && initUser.stage===2){
        const data2 = await axios.post(
          "https://sellbackend.creditclan.com/parent/index.php/globalrequest/get_payment__order",
          { phone: phoneNumber }
        );
        let updateUser6 = await User.findOne({ phone: phoneNumber});
        updateUser6.stage = 3;
       updateUser6.save();
        return res.status(200).json({ message: ` We have found the following  payment request for you. \n *amount* ${account.formatMoney(data2.data.order[Number(response)-1].amount,'₦')} 💰 \n *merchant_name* ${data2.data.order[Number(response)-1].merchant_name} \n *desc* ${data2.data.order[Number(response)-1].description} \n *picture* ${data2.data.order[Number(response)-1].picture} \n  \n kindly enter 👇 \n *[1]* To Make Payment \n *[2]* To Decline`
        })   
    }else if (Number(response) === 2 && initUser.stage===3) {
     let updatedUser2 = await User.findOne({ phone: phoneNumber});
     updatedUser2.stage = 1;
     updatedUser2.save();
      return res
        .status(200)
        .json({ message: "Your request has rejected successfully ❌"});
    } 
    else if (Number(response) === 1 && initUser.stage===3) {
      generateAccountDetail = async () => {
        try {
          const result = await axios.post(
            "https://wema.creditclan.com/generate/account",
            {
              merchant_name: "E Stores",
              amount,
              narration: "PES 2021",
              phone:phoneNumber,
            }
          );
          if (result) {
            let updatedUser3 = await User.findOne({ phone: phoneNumber});
            updatedUser3.stage = 4;
            updatedUser3.save();
            return res.status(200).json({
              message: `Kindly make a payment of ${account.formatMoney(result.data.data.amount,'₦')} to the account below 👇 \n *account No*  ${result.data.data.account_number} \n *bank*  ${result.data.data.bank_name} \n \n kindly enter 👇 \n *[1]* to confirm your payment`,
            });
          }
        } catch (error) {
          return res.status(500).json({ message: "error occur,please try again ⚠️" });
        }
      };
      myFunc = generateAccountDetail;
      myFunc();
    }
     else if (Number(response) === 1 && initUser.stage === 4) {
      try {
        const verify_payment = await axios.post(
          "https://wema.creditclan.com/api/v3/wema/verify_transaction",
          {
            merchant_name: "E Stores",
            amount,
            narration: "PES 2021",
            transaction_reference: "CC_kESfRVAdZyWc3qiTnmFxPYUBX8hK7tG4",
          }
        );
        if (verify_payment.data.status) {
          let updatedUser4 =  await User.findOne({ phone: phoneNumber});
          updatedUser4.stage = 1;
          updatedUser4.save();
          return res
            .status(200)
            .json({ message: "Thank you, we have received your payment 😃" });
        } else if (!verify_payment.data.status) {
          myFunc();
          return res
            .status(200)
            .json({ message: "We have not received your payment,try again" });
        }
      } catch (error) {
         return res.status(500).json("Network issues... kindly try again 😋");
      }
    } 
    else {
      return res.json({message:"invalid value,kindly enter correct one ⚠️"});
    }
  } else {
    return res
      .status(500)
      .json({ message: "both field must be  filled ⚠️" });
  }
};
