import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

function isPdf(url: string) {
    return url.toLowerCase().endsWith(".pdf");
}

function isImage(url: string) {
    return /\.(png|jpg|jpeg|webp|gif)$/i.test(url);
}

export function DocumentViewer({
    open,
    onOpenChange,
    title,
    url,
}: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    title: string;
    url: string;
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between gap-3">
                        <span>{title}</span>
                        <Button asChild variant="outline" size="sm">
                            <a href={url} target="_blank" rel="noreferrer">
                                Abrir em novo separador
                            </a>
                        </Button>
                    </DialogTitle>
                </DialogHeader>

                <div className="h-[70vh] w-full overflow-hidden rounded-md border bg-muted/20">
                    {isPdf(url) ? (
                        <iframe title={title} src={url} className="h-full w-full" />
                    ) : isImage(url) ? (
                        <img
                            src={url}
                            alt={title}
                            className="h-full w-full object-contain bg-black/5"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                            Tipo de ficheiro não suportado para preview.
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
