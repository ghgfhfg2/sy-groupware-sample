import { Stack, Skeleton, SkeletonCircle, SkeletonText } from '@chakra-ui/react'

export default function InsaSkeleton() {
  return (
    <>
    <Stack>
      <Skeleton height='55px' />
      <Skeleton height='50px' />
      <Skeleton height='50px' />
      <Skeleton height='50px' />
      <Skeleton height='50px' />
    </Stack>
    </>
  )
}
