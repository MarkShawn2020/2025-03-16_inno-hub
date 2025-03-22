import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { createInvitationCode } from "./actions";

const formSchema = z.object({
  code: z.string().min(6, {
    message: "邀请码至少需要6个字符",
  }),
  description: z.string().optional(),
  limitUses: z.boolean().default(false),
  maxUses: z.number().optional(),
  setExpiry: z.boolean().default(false),
  expiresAt: z.date().optional(),
});

export function CreateInvitationCodeForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
      description: "",
      limitUses: false,
      maxUses: undefined,
      setExpiry: false,
      expiresAt: undefined,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);

    try {
      // Process the form data
      const formData = {
        code: values.code,
        description: values.description || null,
        maxUses: values.limitUses ? values.maxUses || null : null,
        expiresAt: values.setExpiry ? values.expiresAt || null : null,
      };

      const result = await createInvitationCode(formData);
      
      if (result.success) {
        toast.success("邀请码创建成功");
        form.reset();
      } else {
        toast.error(result.message || "创建邀请码失败");
      }
    } catch (error) {
      console.error("Failed to create invitation code:", error);
      toast.error("创建邀请码时发生错误");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>邀请码</FormLabel>
              <FormControl>
                <Input placeholder="输入邀请码" {...field} />
              </FormControl>
              <FormDescription>
                创建一个唯一的邀请码，用户可以在注册时使用
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>描述（可选）</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="描述这个邀请码的用途"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="limitUses"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>限制使用次数</FormLabel>
                  <FormDescription>
                    设置此邀请码的最大使用次数
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          {form.watch("limitUses") && (
            <FormField
              control={form.control}
              name="maxUses"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>最大使用次数</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      placeholder="输入使用次数限制"
                      {...field}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        field.onChange(isNaN(value) ? undefined : value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="setExpiry"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>设置过期时间</FormLabel>
                  <FormDescription>
                    设置此邀请码的过期时间
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          {form.watch("setExpiry") && (
            <FormField
              control={form.control}
              name="expiresAt"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>过期日期</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className="w-full pl-3 text-left font-normal"
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>选择日期</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "创建中..." : "创建邀请码"}
        </Button>
      </form>
    </Form>
  );
} 