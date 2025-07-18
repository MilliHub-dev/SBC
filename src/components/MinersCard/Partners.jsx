import { Box, Image, Text } from "@chakra-ui/react";
import React from "react";
import { partnersImg } from "../../assets/images/imagesData";

const Partners = () => {
  return (
    <Box mt={20}>
      <Text as={"h3"} fontSize={"30px"} fontWeight={"400"} color={"gray.500"}>
        Our Partners:
      </Text>
      <Box display={"flex"} flexWrap={"wrap"} gap={8} mt={5}>
        {partnersImg.map((images, index) => {
          return (
            <Image
              key={index}
              height={"25px"}
              src={images.img}
              alt={images.title}
              objectFit={"contain"}
            />
          );
        })}
      </Box>
    </Box>
  );
};

export default Partners;
