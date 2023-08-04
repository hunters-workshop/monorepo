import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { ConnectWallet, useAddress, useSigner } from '@thirdweb-dev/react'
import { createMeToken, approveTokens, isApprovedAmount, getMeTokenInfo, mint, getTokenAllowance } from 'utils/fetchers/createMeToken'
import { getMeTokenContract } from 'utils/fetchers/createMeToken'
import { Box, Button, Divider, FormControl, FormErrorMessage, FormLabel, Heading, Input, Stack, useToast } from '@chakra-ui/react'
import { getMeTokenFor } from 'utils/fetchers/createMeToken'
import Image from 'next/image'
import { useRouter } from 'next/router'
import styles from './ComponentStyle.module.css'


export default function MeTokenCreationForm() {
  const {
    register,
    watch,
    handleSubmit,
    getValues,
    formState: { errors },
    reset,
  } = useForm()
  const address = useAddress()
  const [meTokenContract, setMeTokenContract] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isApproved, setApproved] = useState(false)
  const [approvalAmount, setApprovalAmount] = useState(0)
  const [meTokenAddress, setMeTokenAddress] = useState('')
  const [meTokenInfo, setMeTokenInfo] = useState<any>(null)
  const toast = useToast();
  const signer = useSigner()
  const router = useRouter()

  const typedValue = watch('typedValue');

    

  useEffect(() => {
    const addy = router.query.address || address
    if (!addy || !signer) return
    const getMeToken = async () => {
      getMeTokenFor((addy as string), signer).then((res) => {
        if (res === '0x0000000000000000000000000000000000000000') return
        setMeTokenAddress(res)
      })
    }
    getMeToken()
  }, [router.query, address, signer])

  useEffect(() => {
    if (!meTokenAddress || !address || !signer) return
    const getData = async () => {
      getMeTokenInfo(meTokenAddress, address, signer).then(setMeTokenInfo)
    }
    getData()
  }, [meTokenAddress, signer, address])

  useEffect(() => {
    const getContract = async () => {
      const contract = await getMeTokenContract(signer)
      setMeTokenContract(contract)
    }
    getContract()
  }, [address])

  useEffect(() => {
    const assetsDeposited = getValues('assetsDeposited')
    if (address && signer && assetsDeposited) {
      const amount = isApprovedAmount(address, assetsDeposited, signer)
      amount.then(setApprovalAmount)
    }
  }, [address, signer])

  useEffect(() => {
    if (address && signer && typedValue){
      const fetchApprovedAmount = async () => {
        const compResult = await getTokenAllowance(address, signer, typedValue);        
        const test = Number(compResult) - typedValue;
        if (test >= 0) {
          setApproved(true);
        } else {
          setApproved(false);
        } 
        };
        
        fetchApprovedAmount();  
    }}, [address, signer, typedValue]);
    

  const approve = async () => {
    const assetsDeposited = getValues('assetsDeposited')
    if (!isApproved && address && assetsDeposited) {
      await approveTokens(assetsDeposited, signer)
      setApproved(true)      
      toast({
        title: 'Approval Successful!',
        status: 'success',
        isClosable: true,
      });
    } else {
      console.log('Error approving tokens')
      toast({
        title: 'Approval Failed.',
        description: 'There was an error while approving your allowance.',
        status: 'error',
        isClosable: true,
      });
    }
  }

  const onSubmit = async (data: any) => {
    setIsLoading(true)

    try {
      const { name, symbol, hubId, assetsDeposited } = data
      const tx = await createMeToken({ name, symbol, hubId, assetsDeposited }, signer )
      console.log(tx)
      setIsSubmitted(true)
    } catch (error) {
      console.log('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let timer: any

    if (isSubmitted) {
      timer = setTimeout(() => {
        setIsSubmitted(false)
        setIsLoading(false)
      }, 3000)
    }

    return () => {
      clearTimeout(timer)
    }
  }, [isSubmitted])



  const approveBuy = async () => {
    const purchaseAmount = getValues('typedValue')
    await approveTokens(purchaseAmount, signer)
    setApproved(true)
  }             
 

  const buy = async () => {
    const purchaseAmount = getValues('purchaseAmount')
    await mint(meTokenAddress, purchaseAmount, address!, signer)
  }

  return (
    <Box
      as="form"
      onSubmit={handleSubmit(onSubmit)}
      position="relative"
      bg="#171923"
      borderRadius="3xl"
      boxShadow="2xl"
      overflow="hidden"
      width="100%"
      display="flex"
      flexDirection="column"
      padding="1px"
      alignItems="center"
      mb="30px">
      {
        meTokenInfo ? (
          <Box bg="#171923" position="relative" zIndex={2} p={8} overflow="hidden" width="100%" height="100%" borderRadius="3xl">
          <Heading mb={3} fontSize="2em" fontWeight="bold" color="#EDEDEE" textAlign="center">
            meToken Info
          </Heading>
          <Divider width="75%" margin="0 auto" marginBottom="3em" border="none" borderBottom="1px solid #EDEDEE" />
          <Stack spacing={4} width="100%">
            <Box>{meTokenInfo.meTokenAddress}</Box>
            <Box>{meTokenInfo.symbol}</Box>
            <img src={meTokenInfo.profilePicture} alt={''} style={{ height: '100px', width: '100px', borderRadius: '12px' }} />
            <FormControl isInvalid={!!errors.name}>
              <FormLabel color="white">Amount to purchase (DAI):</FormLabel>
              <Input type="text" placeholder="Amount To Purchase" {...register('typedValue', { required: true, })} />
              <FormErrorMessage>This field is required</FormErrorMessage>
            </FormControl>
            <Button
            background="linear-gradient(to right, #E03C88, #E34335, #F6B138)"
            onClick={approveBuy}
            variant="solid"
            disabled={isApproved}
            >
              Approve
            </Button>
            <Button
              background="linear-gradient(to right, #E03C88, #E34335, #F6B138)"
              onClick={buy}
              variant="solid"
              className={`${styles['buy-button']} ${
                !isApproved ? styles['disabled-button'] : ''
              }`}
              disabled={isApproved}
            >
              Buy
            </Button>
          </Stack>
          </Box>
        ) : (
          <Box bg="#171923" position="relative" zIndex={2} p={8} overflow="hidden" width="100%" height="100%" borderRadius="3xl">
          <Heading mb={3} fontSize="2em" fontWeight="bold" color="#EDEDEE" textAlign="center">
            meToken Creation Form
          </Heading>
          <Divider width="75%" margin="0 auto" marginBottom="3em" border="none" borderBottom="1px solid #EDEDEE" />
          <Stack spacing={4} width="100%">
            <FormControl isInvalid={!!errors.name}>
              <FormLabel color="white">Name:</FormLabel>
              <Input type="text" placeholder="Your meToken Name" {...register('name', { required: true })} />
              <FormErrorMessage>This field is required</FormErrorMessage>
            </FormControl>
            <FormControl isInvalid={!!errors.symbol}>
              <FormLabel color="#EDEDEE">Symbol:</FormLabel>
              <Input type="text" placeholder="Your meToken symbol" {...register('symbol', { required: true })} />
              <FormErrorMessage>This field is required</FormErrorMessage>
            </FormControl>
  
              <Input type="hidden" value="1" {...register('hubId')} />
            <FormControl isInvalid={!!errors.assetsDeposited}>
              <FormLabel color="#EDEDEE">Assets Deposited:</FormLabel>
              <Input type="text" placeholder="Number of assets deposited" {...register('assetsDeposited', { required: true })} />
              <FormErrorMessage>This field is required</FormErrorMessage>
            </FormControl>
          </Stack>
          <Box display="flex" flexDirection="row" alignItems="center" justifyContent="start" mt={5} gap={5} sx={{
            button: {
              minWidth: '150px',
              borderRadius: "10px",
              fontSize: "18px",
              fontWeight:"bold",
              height:"50px",
              padding:"10px"
            }
          }}>
            <Button
              background="linear-gradient(to right, #E03C88, #E34335, #F6B138)"
              onClick={approve}
              variant="solid"
              disabled={isApproved}
              >
                Approve
              </Button>
          {isLoading && isApproved ? (
            <Button
              type="submit"
              disabled
              background="linear-gradient(to right, #E03C88, #E34335, #F6B138)">
              Creating meToken...
            </Button>
          ) : (
            <Button
              disabled={!isApproved || isLoading}
              type="submit"
              background="linear-gradient(to right, #E03C88, #E34335, #F6B138)">
              {isSubmitted ? 'meToken Created!' : 'Submit'}
            </Button>
            )}
          </Box>        
        </Box>
        )
      }
     
      <Box position="absolute" inset="-1px" borderRadius="3xl" background="linear-gradient(to top, #E03C88, #E34335, #F6B138, transparent, transparent)" zIndex={0} />
    </Box>
  )
}
