import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { FormProvider, useForm } from "react-hook-form"

import { Interview } from "@/types"
import { CustomBreadCrumb } from "./custom-bread-crumb";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@clerk/clerk-react";
import { Headings } from "./headings";
import { Loader, Trash2 } from "lucide-react";
import { Button } from "./button";
import { Separator } from "./separator";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "./form";
import { Input } from "./input";
import { Textarea } from "./textarea";
import { chatSession } from "@/scripts";
import { addDoc, collection, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "@/config/firebase.config";
import { error } from "console";

interface FormMockInterviewProps{
    initialData : Interview | null;
}

const formSchema =z.object({
    position:z
    .string()
    .min(1,"position is required")
    .max(100,"position must be 100 character or less"),
    description:z.string().min(10,"description is required"),
    experience:z.coerce
    .number()
    .min(0,"Experience can not be negative"),
    techStack:z.string().min(1,"Techstack must be atleast a character"),

});

type formData=z.infer<typeof formSchema>

export const FormMockInterview = ({initialData}: FormMockInterviewProps) => {

    const form=useForm<formData>({resolver:zodResolver(formSchema),
        defaultValues:initialData || {}
    })

    const {isValid, isSubmitting}=form.formState;
    const [loading, setLoading]=useState(false);
    const navigate=useNavigate();
    const {userId}=useAuth();

    const title =initialData?.position ? initialData?.position :"Create a new mock interview";

    const breadCrumpPage = initialData?.position ? initialData?.position :"Create";

    const actions= initialData ? "Save changes": "Create";
    const toastMessage=initialData
    ? {title:"updated", description:"Changes saved successfully..."}
    :{title:"Created", description:"New mock interview created..."}


    const cleanAiResponse = (responseText : string) =>{
        //Step 1: Trim any surrounding whitespaces
        let cleanText = responseText.trim();
        //Step 2: Remove any occurrences of "json" code block symbols {``` or `}
        cleanText = cleanText.replace(/(json|```|`)/g,"");
        //Step 3: Extract a JSON array by capturing text between square brackets
        const jsonArrayMatch = cleanText.match(/\[.*\]/s);
        if(jsonArrayMatch){
            cleanText = jsonArrayMatch[0];
        }else{
            throw new Error("No JSON array found in response");
        }

        //Step 4: Parse the clean JSON text into array of objects
        try{
            return JSON.parse(cleanText);
        }catch(error){
            throw new Error("Invalid JSON format: "+(error as Error)?.message);
        }
    };
    const generateAiResponse = async(data: formData) =>{
        const prompt = `
        As an experienced prompt engineer, generate a JSON array containing 5 technical interview questions along with detailed answers based on the following job information. Each object in the array should have the fields "question" and "answer", formatted as follows:

        [
          {"question": "<Question text>", "anwser":"<Answer text>"}
          ...
        ]

        Job Information:
        - Job Position: ${data?.position}
        - Job Description: ${data?.description}
        - Years of Experience Required: ${data?.experience}
        - Tech Stacks: ${data?.techStack}

        The questions should assests skills in ${data?.techStack} development and best practises, problem-solving, and experience handling complex requirements. Please format the output strictly as an array of JSON objects without any additional labels, code blocks or explanations. Return only the JSON array with questions and anwsers.
        `;

    const aiResult = await chatSession.sendMessage(prompt);
    const cleanedResponse = cleanAiResponse(aiResult.response.text());

    return cleanedResponse;
}

    const onSubmit = async(data:formData)=>{
        try{
            setLoading(true);
            if(initialData){
                //update
                if(isValid){
                    const aiResult = await generateAiResponse(data); 

                    await updateDoc(doc(db,"interviews",initialData?.id),{
                        ...data,
                        updatedAt : serverTimestamp(),
                    }).catch((error)=>console.log(error));
                    toast(toastMessage.title,{description : toastMessage.description});
                }
            }else{
                //create a new mock interview
                if(isValid){
                    const aiResult = await generateAiResponse(data); 

                    await addDoc(collection(db,"interviews"),{
                        ...data,
                        userId,
                        questions : aiResult,
                        createdAt : serverTimestamp(),
                    });

                    toast(toastMessage.title,{description : toastMessage.description})

                }
            }
            navigate("/generate",{replace:true});
        }
        catch(error){
            console.log(error);
            toast.error("Error..",{
                description : `Something went wrong. Please try again later`,
            });
        }finally{
            setLoading(false);
        }
    };

    useEffect(()=> {
        if(initialData){
            form.reset({
                position:initialData.position,
                description:initialData.description,
                experience:initialData.experience,
                techStack:initialData.techStack,
            });
        }
    },[initialData,form]);

  return <div className="w-full flex-col space-y-4">
    <CustomBreadCrumb
    breadCrumbPage={breadCrumpPage}
    breadCrumpItems={[{label:"Mock Interviews", link:"/generate"}]}
    />
    <div className="mt-4 flex items-center justify-between w-full">
        <Headings title={title} isSubHeading/>

        {initialData && (
            <Button size={"icon"} variant={"ghost"}>
                <Trash2 className="min-w-4 min-h-4 text-red-500"/>
            </Button>
        )}
    </div>
    <Separator className="my-4" />

    <div className="my-6">
    <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}
        className="w-full p-8 rounded-lg flex flex-col items-start justify-start gap-6 shadow-md">
            <FormField control={form.control}
            name="position"
            render={({field}) =>(
                <FormItem className="w-full space-y-4">
                    <div className="w-full flex items-center justify-between">
                        <FormLabel>Job Role / Job Position</FormLabel>
                        <FormMessage className="text-sm"></FormMessage>
                    </div>
                    <FormControl>
                        <Input 
                          disabled={loading} 
                          className="h-12"
                          placeholder="eg. Full stack developer"
                          {...field}
                          value={field.value || ""}
                          />
                    </FormControl>
                </FormItem>
            )}
            />

            {/* description */}
            <FormField control={form.control}
            name="description"
            render={({field}) =>(
                <FormItem className="w-full space-y-4">
                    <div className="w-full flex items-center justify-between">
                        <FormLabel>Job description</FormLabel>
                        <FormMessage className="text-sm"></FormMessage>
                    </div>
                    <FormControl>
                        <Textarea 
                          disabled={loading} 
                          className="h-12"
                          placeholder="Describe your job role or postion..."
                          {...field}
                          value={field.value || ""}
                          />
                    </FormControl>
                </FormItem>
            )}
            />

            {/* experience */}
            <FormField control={form.control}
            name="experience"
            render={({field}) =>(
                <FormItem className="w-full space-y-4">
                    <div className="w-full flex items-center justify-between">
                        <FormLabel>Years of experience</FormLabel>
                        <FormMessage className="text-sm"></FormMessage>
                    </div>
                    <FormControl>
                        <Input 
                         type="number"
                          disabled={loading} 
                          className="h-12"
                          placeholder="eg. 5 years in number"
                          {...field}
                          value={field.value || ""}
                          />
                    </FormControl>
                </FormItem>
            )}
            />

<FormField control={form.control}
            name="techStack"
            render={({field}) =>(
                <FormItem className="w-full space-y-4">
                    <div className="w-full flex items-center justify-between">
                        <FormLabel>Tech Stacks</FormLabel>
                        <FormMessage className="text-sm"></FormMessage>
                    </div>
                    <FormControl>
                        <Input 
                          disabled={loading} 
                          className="h-12"
                          placeholder="eg. React, Typescript... (Separate the values using comma)"
                          {...field}
                          value={field.value || ""}
                          />
                    </FormControl>
                </FormItem>
            )}
            />
            <div className="w-full flex items-center justify-end gap-8">
                <Button 
                  type="reset"
                  size={"sm"}
                  variant={"outline"}
                  disabled={isSubmitting || loading}
                  >
                    Reset
                  </Button>
                  <Button 
                  type="submit"
                  size={"sm"}
                  disabled={isSubmitting || loading || !isValid}
                  >
                    {loading ? (<Loader className="text-gray-50 animate-spin"/>):(actions)}
                  </Button>
            </div>
        </form>
    </FormProvider>
    </div>
  </div>;
};
